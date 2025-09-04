/** @format */

import { PassThrough, Readable } from 'stream'
import EventSourceStream from '@server-sent-stream/node'
import { GLMEmbedRequest, GLMEmbedResponse } from '../../interface/IGLM'
import { GLMChatModel, GLMEmbedModel } from '../../interface/Enum'
import { ChatMessage, ChatResponse, EmbeddingResponse } from '../../interface/IModel'
import $ from '../util'
import { GPTChatRequest, GPTChatResponse, GPTChatStreamRequest, GPTChatStreamResponse } from '../../interface/IOpenAI'
import { ChatCompletionTool, ChatCompletionToolChoiceOption } from 'openai/resources.js'

const API = 'https://open.bigmodel.cn'

export default class GLM {
    private key?: string | string[]
    private proxyAPI: string

    constructor(key?: string | string[], proxyAPI: string = API) {
        this.key = key
        this.proxyAPI = proxyAPI
    }

    /**
     * Fetches embeddings for input text.
     *
     * @param input - An array of input strings.
     * @param model - The model to use for embeddings (default: text-embedding-ada-002).
     * @returns A promise resolving to the embedding response.
     */
    async embedding(input: string[], model: GLMEmbedModel = GLMEmbedModel.EMBED_2, dimensions = 1024) {
        const key = Array.isArray(this.key) ? $.getRandomKey(this.key) : this.key
        if (!key) throw new Error('ZhiPu GLM API key is not set in config')

        const res = await $.post<GLMEmbedRequest, GLMEmbedResponse>(
            `${this.proxyAPI}/api/paas/v4/embeddings`,
            { model, input, dimensions },
            { headers: { Authorization: `Bearer ${key}` }, responseType: 'json' }
        )

        return {
            embedding: res.data.map(v => v.embedding),
            object: 'embedding',
            model,
            promptTokens: res.usage.prompt_tokens,
            totalTokens: res.usage.total_tokens
        } as EmbeddingResponse
    }

    /**
     * Sends messages to the GLM chat model.
     *
     * @param messages - An array of chat messages.
     * @param model - The model to use for chat (default: GLM_6B a local deployed chatglm3-6b-32k).
     * @param stream - Whether to use stream response (default: false).
     * @param top - Top probability to sample (optional).
     * @param temperature - Temperature for sampling (optional).
     * @param maxLength - Maximum token length for response (optional).
     * @returns A promise resolving to the chat response or a stream.
     */
    async chat(
        messages: ChatMessage[],
        model: GLMChatModel = GLMChatModel.GLM_3_TURBO,
        stream: boolean = false,
        top?: number,
        temperature?: number,
        maxLength?: number,
        tools?: ChatCompletionTool[],
        toolChoice?: ChatCompletionToolChoiceOption
    ) {
        // filter images
        if (![GLMChatModel.GLM_4V, GLMChatModel.GLM_4V_PLUS].includes(model))
            messages = messages.map(({ role, content }) => ({ role, content }))

        // temperature is float in (0,1]
        if (typeof temperature === 'number') {
            if (temperature <= 0) temperature = 0.1
            if (temperature > 1) temperature = 1
        }
        // top is float in (0,1)
        if (typeof top === 'number') {
            if (top <= 0) top = 0.1
            if (top >= 1) top = 0.9
        }

        const data: ChatResponse = {
            content: '',
            model,
            object: '',
            promptTokens: 0,
            completionTokens: 0,
            totalTokens: 0
        }

        // ZhiPu GLM official API
        const key = Array.isArray(this.key) ? $.getRandomKey(this.key) : this.key
        if (!key) throw new Error('ZhiPu GLM API key is not set in config')

        const res = await $.post<GPTChatRequest | GPTChatStreamRequest, Readable | GPTChatResponse>(
            `${this.proxyAPI}/api/paas/v4/chat/completions`,
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

        if (res instanceof Readable) {
            const output = new PassThrough()
            const parser = new EventSourceStream()

            parser.on('data', (e: MessageEvent) => {
                const obj = $.json<GPTChatStreamResponse>(e.data)
                if (obj) {
                    data.content = obj.choices[0]?.delta?.content || ''
                    if (obj.choices[0]?.delta?.tool_calls) data.tools = obj.choices[0]?.delta?.tool_calls
                    data.model = obj.model
                    data.object = obj.object || 'chat.completion.chunk'
                    data.promptTokens = obj.usage?.prompt_tokens || 0
                    data.completionTokens = obj.usage?.completion_tokens || 0
                    data.totalTokens = obj.usage?.total_tokens || 0
                    if (data.content) output.write(JSON.stringify(data))
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
            data.model = res.model
            data.object = res.object || 'chat.completion'
            data.promptTokens = res.usage?.prompt_tokens || 0
            data.completionTokens = res.usage?.completion_tokens || 0
            data.totalTokens = res.usage?.total_tokens || 0
            return data
        }
    }
}
