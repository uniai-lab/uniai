/**
 * Other.ts - A class for accessing the Other model's chat and embedding functionality.
 * Such as models from hugging face, text2vec
 *
 * @format by prettier
 * @author devilyouwei
 */

import { PassThrough, Readable } from 'stream'
import EventSourceStream from '@server-sent-stream/node'
import { ChatModel, EmbedModel } from '../../interface/Enum'
import { ChatMessage, ChatResponse, EmbeddingResponse } from '../../interface/IModel'
import $ from '../util'
import {
    GPTChatRequest,
    GPTChatResponse,
    GPTChatStreamRequest,
    GPTChatStreamResponse,
    OpenAIEmbedRequest,
    OpenAIEmbedResponse
} from '../../interface/IOpenAI'
import { ChatCompletionTool, ChatCompletionToolChoiceOption } from 'openai/resources'

export default class Other {
    private api?: string
    private key?: string | string[]

    /**
     * Constructor for the OpenAI class.
     *
     * @param api - The API endpoint for the model (optional).
     * @param key - The API key for the model (Optional).
     */
    constructor(api?: string, key?: string | string[]) {
        this.api = api
        this.key = key
    }

    /**
     * Fetches embeddings for input text.
     *
     * @param input - An array of input strings.
     * @param model - The model to use for embeddings (default: text-embedding-ada-002).
     * @returns A promise resolving to the embedding response.
     */
    async embedding(input: string[], model: EmbedModel = '', dimensions = 1024) {
        if (!this.api) throw new Error('Other embed model API is not set in config')
        const key = Array.isArray(this.key) ? $.getRandomKey(this.key) : this.key

        const res = await $.post<OpenAIEmbedRequest, OpenAIEmbedResponse>(
            `${this.api}/v1/embeddings`,
            { model, input, dimensions },
            { headers: { Authorization: `Bearer ${key}` }, responseType: 'json' }
        )

        const data: EmbeddingResponse = {
            embedding: res.data.map(v => v.embedding),
            object: 'embedding',
            model,
            promptTokens: res.usage.prompt_tokens || 0,
            totalTokens: res.usage.total_tokens || 0
        }
        return data
    }

    /**
     * Sends messages to the GPT compatible chat model.
     *
     * @param messages - An array of chat messages.
     * @param model - The model to use for chat (default: gpt-3.5-turbo).
     * @param stream - Whether to use stream response (default: false).
     * @param top - Top probability to sample (optional).
     * @param temperature - Temperature for sampling (optional).
     * @param maxLength - Maximum token length for response (optional).
     * @returns A promise resolving to the chat response or a stream.
     */
    async chat(
        messages: ChatMessage[],
        model: ChatModel = '',
        stream: boolean = false,
        top?: number,
        temperature?: number,
        maxLength?: number,
        tools?: ChatCompletionTool[],
        toolChoice?: ChatCompletionToolChoiceOption
    ) {
        if (!this.api) throw new Error('Other chat model API is not set in config')
        const key = Array.isArray(this.key) ? $.getRandomKey(this.key) : this.key

        const res = await $.post<GPTChatRequest | GPTChatStreamRequest, Readable | GPTChatResponse>(
            `${this.api}/v1/chat/completions`,
            {
                model,
                messages: $.formatGPTMessage(messages),
                stream,
                temperature,
                top_p: top,
                max_tokens: maxLength,
                tools,
                tool_choice: toolChoice
            },
            { headers: { Authorization: `Bearer ${key}` }, responseType: stream ? 'stream' : 'json' }
        )

        const data: ChatResponse = {
            content: '',
            model,
            object: '',
            promptTokens: 0,
            completionTokens: 0,
            totalTokens: 0
        }

        if (res instanceof Readable) {
            const output = new PassThrough()
            const parser = new EventSourceStream()

            parser.on('data', (e: MessageEvent) => {
                const obj = $.json<GPTChatStreamResponse>(e.data)
                if (obj) {
                    data.content = obj.choices[0]?.delta?.content || ''
                    if (obj.choices[0]?.delta?.tool_calls) data.tools = obj.choices[0]?.delta?.tool_calls
                    data.model = obj.model || model
                    data.object = obj.object || 'chat.completion.chunk'
                    data.promptTokens = obj.usage?.prompt_tokens || 0
                    data.completionTokens = obj.usage?.completion_tokens || 0
                    data.totalTokens = obj.usage?.total_tokens || 0
                    output.write(JSON.stringify(data))
                }
            })
            parser.on('error', e => output.destroy(e))
            parser.on('end', () => output.end())

            res.pipe(parser)

            // output closed, close parser & LLM response
            output.on('close', () => {
                if (!res.destroyed) res.destroy(new Error('Downstream closed, aborting upstream SSE'))
                if (!parser.destroyed) parser.destroy()
            })
            return output as Readable
        } else {
            data.content = res.choices[0]?.message?.content || ''
            if (res.choices[0]?.message?.tool_calls) data.tools = res.choices[0]?.message?.tool_calls
            data.model = res.model || model
            data.object = res.object || 'chat.completion'
            data.promptTokens = res.usage?.prompt_tokens || 0
            data.completionTokens = res.usage?.completion_tokens || 0
            data.totalTokens = res.usage?.total_tokens || 0
            return data
        }
    }
}
