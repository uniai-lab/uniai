/**
 * Utility for connecting to the GPT model API.
 *
 * @format prettier
 * @author devilyouwei
 */

import { PassThrough, Readable } from 'stream'
import EventSourceStream from '@server-sent-stream/node'
import { decodeStream } from 'iconv-lite'
import {
    GPTChatRequest,
    GPTChatResponse,
    GPTChatStreamRequest,
    GPTImagineRequest,
    GPTImagineResponse,
    GPTImagineSize,
    GPTChatStreamResponse,
    GPTChatMessage,
    OpneAIEmbedRequest,
    OpenAIEmbedResponse
} from '../../interface/IOpenAI'
import { ChatRoleEnum, GPTChatRoleEnum, OpenAIChatModel, OpenAIEmbedModel } from '../../interface/Enum'
import { ChatResponse, ChatMessage } from '../../interface/IModel'
import { EmbeddingResponse } from '../../interface/IModel'
import $ from '../util'

const API = 'https://api.openai.com'
const VER = 'v1'

export default class OpenAI {
    private api: string
    private key?: string

    /**
     * Constructor for OpenAI class.
     * @param key - The API key for OpenAI.
     * @param api - The API endpoint for making requests (optional).
     */
    constructor(key?: string, api: string = API) {
        this.key = key
        this.api = api
    }

    /**
     * Fetches embeddings for input text.
     *
     * @param input - An array of input strings.
     * @param model - The model to use for embeddings (default: text-embedding-ada-002).
     * @returns A promise resolving to the embedding response.
     */
    async embedding(input: string[], model: OpenAIEmbedModel = OpenAIEmbedModel.ADA2): Promise<EmbeddingResponse> {
        if (!this.key) throw new Error('OpenAI API key is not set in config')

        const res = await $.post<OpneAIEmbedRequest, OpenAIEmbedResponse>(
            `${this.api}/${VER}/embeddings`,
            { model, input },
            { headers: { Authorization: `Bearer ${this.key}` }, responseType: 'json' }
        )
        const data: EmbeddingResponse = {
            embedding: res.data.map(v => v.embedding),
            object: 'embedding',
            model,
            dimension: res.data[0].embedding.length || 0,
            promptTokens: res.usage.prompt_tokens || 0,
            totalTokens: res.usage.total_tokens || 0
        }
        return data
    }

    /**
     * Sends messages to the GPT chat model.
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
        model: OpenAIChatModel = OpenAIChatModel.GPT3,
        stream: boolean = false,
        top?: number,
        temperature?: number,
        maxLength?: number
    ) {
        if (!this.key) throw new Error('OpenAI API key is not set in config')

        const res = await $.post<GPTChatRequest | GPTChatStreamRequest, Readable | GPTChatResponse>(
            `${this.api}/${VER}/chat/completions`,
            { model, messages: this.formatMessage(messages), stream, temperature, top_p: top, max_tokens: maxLength },
            { headers: { Authorization: `Bearer ${this.key}` }, responseType: stream ? 'stream' : 'json' }
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
                if (obj?.choices[0].delta?.content) {
                    data.content = obj.choices[0].delta.content
                    data.model = obj.model
                    data.object = obj.object
                    output.write(JSON.stringify(data))
                }
            })

            parser.on('error', e => output.destroy(e))
            parser.on('end', () => output.end())

            res.pipe(decodeStream('utf-8')).pipe(parser)
            return output as Readable
        } else {
            data.content = res.choices[0].message.content || ''
            data.model = res.model
            data.object = res.object
            data.promptTokens = res.usage?.prompt_tokens || 0
            data.completionTokens = res.usage?.completion_tokens || 0
            data.totalTokens = res.usage?.total_tokens || 0
            return data
        }
    }

    /**
     * Generates images based on a prompt.
     *
     * @param prompt - The prompt for image generation.
     * @param nPrompt - The negative prompt (optional).
     * @param width - Image width (default: 1024).
     * @param height - Image height (default: 1024).
     * @param n - Number of images to generate (default: 1).
     * @returns A promise resolving to the image generation response.
     */
    async imagine(prompt: string, nPrompt: string = '', width: number = 1024, height: number = 1024, n: number = 1) {
        if (!this.key) throw new Error('OpenAI API key is not set in config')

        return await $.post<GPTImagineRequest, GPTImagineResponse>(
            `${this.api}/${VER}/images/generations`,
            {
                prompt: `Positive prompt: ${prompt}\nNegative prompt: ${nPrompt}`,
                n,
                size: `${width}x${height}` as GPTImagineSize
            },
            { headers: { Authorization: `Bearer ${this.key}` }, responseType: 'json' }
        )
    }

    /**
     * Formats chat messages according to the GPT model's message format.
     *
     * @param messages - An array of chat messages.
     * @returns Formatted messages compatible with the GPT model.
     */
    private formatMessage(messages: ChatMessage[]) {
        const prompt: GPTChatMessage[] = []

        for (const { role, content } of messages)
            if (role === ChatRoleEnum.FUNCTION) continue
            else prompt.push({ role, content })

        if (prompt[prompt.length - 1].role !== GPTChatRoleEnum.USER) throw new Error('User input nothing')
        return prompt
    }
}
