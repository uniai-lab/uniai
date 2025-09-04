/** @format */

import { PassThrough, Readable } from 'stream'
import EventSourceStream from '@server-sent-stream/node'
import { AliChatModel, AliEmbedModel } from '../../interface/Enum'
import { ChatMessage, ChatResponse, EmbeddingResponse } from '../../interface/IModel'
import {
    GPTChatRequest,
    GPTChatResponse,
    GPTChatStreamRequest,
    GPTChatStreamResponse,
    OpenAIEmbedRequest,
    OpenAIEmbedResponse
} from '../../interface/IOpenAI'
import $ from '../util'

const API = 'https://dashscope.aliyuncs.com'
const VER = 'v1'

export default class AliYun {
    private key?: string | string[]
    private api?: string

    /**
     * Constructor for AliYun class.
     * @param key - The API key for MoonShot.
     * @param api - The API endpoint for proxy (optional).
     */
    constructor(key?: string | string[], api: string = API) {
        this.key = key
        this.api = api
    }

    /**
     * Fetches embeddings for input text.
     *
     * @param input - An array of input strings.
     * @param model - The model to use for embeddings (default: text-embedding-v3).
     * @param dimensions - The dimensions of output embedding vector (default: 1024)
     * @returns A promise resolving to the embedding response.
     */
    async embedding(input: string[], model: AliEmbedModel = AliEmbedModel.ALI_V3, dimensions = 1024) {
        const key = Array.isArray(this.key) ? $.getRandomKey(this.key) : this.key
        if (!key) throw new Error('AliYun API key is not set in config')

        const res = await $.post<OpenAIEmbedRequest, OpenAIEmbedResponse>(
            `${this.api}/compatible-mode/${VER}/embeddings`,
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
     * Sends messages to the AliYun LLMs.
     *
     * @param messages - An array of chat messages.
     * @param model - The model to use for chat (default: moonshot-v1-8k).
     * @param stream - Whether to use stream response (default: false).
     * @param top - Top probability to sample (optional).
     * @param temperature - Temperature for sampling (optional).
     * @param maxLength - Maximum token length for response (optional).
     * @returns A promise resolving to the chat response or a stream.
     */
    async chat(
        messages: ChatMessage[],
        model: AliChatModel = AliChatModel.QWEN_TURBO,
        stream: boolean = false,
        top?: number,
        temperature?: number,
        maxLength?: number
    ) {
        const key = Array.isArray(this.key) ? $.getRandomKey(this.key) : this.key
        if (!key) throw new Error('Qian Wen API key is not set in config')

        // temperature is float in [0,1]
        if (typeof temperature === 'number') {
            if (temperature < 0) temperature = 0
            if (temperature >= 2) temperature = 1.9
        }
        // top is float in [0,1]
        if (typeof top === 'number') {
            if (top <= 0) top = 0.1
            if (top > 1) top = 1.0
        }

        const res = await $.post<GPTChatRequest | GPTChatStreamRequest, Readable | GPTChatResponse>(
            `${this.api}/compatible-mode/${VER}/chat/completions`,
            {
                model,
                messages: $.formatGPTMessage(messages),
                stream,
                temperature,
                top_p: top,
                max_tokens: maxLength
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
                    data.content = obj?.choices[0]?.delta?.content || ''
                    data.model = obj.model
                    data.object = obj.object
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
            data.model = res.model
            data.object = res.object || 'chat.completion'
            data.promptTokens = res.usage?.prompt_tokens || 0
            data.completionTokens = res.usage?.completion_tokens || 0
            data.totalTokens = res.usage?.total_tokens || 0
            return data
        }
    }
}
