/** @format */

import { PassThrough, Readable } from 'stream'
import EventSourceStream from '@server-sent-stream/node'
import { MoonShotChatModel } from '../../interface/Enum'
import { ChatMessage, ChatResponse } from '../../interface/IModel'
import { GPTChatRequest, GPTChatResponse, GPTChatStreamRequest, GPTChatStreamResponse } from '../../interface/IOpenAI'
import $ from '../util'

const API = 'https://api.moonshot.cn'
const VER = 'v1'

export default class MoonShot {
    private key?: string | string[]
    private api?: string

    /**
     * Constructor for MoonShot class.
     * @param key - The API key for MoonShot.
     * @param api - The API endpoint for proxy (optional).
     */
    constructor(key?: string | string[], api: string = API) {
        this.key = key
        this.api = api
    }

    /**
     * Sends messages to the MoonShot chat model.
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
        model: MoonShotChatModel = MoonShotChatModel.MOON_V1_8K,
        stream: boolean = false,
        top?: number,
        temperature?: number,
        maxLength?: number
    ) {
        // if (!Object.values(MoonShotChatModel).includes(model)) throw new Error('MoonShot chat model not found')

        const key = Array.isArray(this.key) ? $.getRandomKey(this.key) : this.key
        if (!key) throw new Error('MoonShot API key is not set in config')

        // temperature is float in [0,1]
        if (typeof temperature === 'number') {
            if (temperature < 0) temperature = 0
            if (temperature > 1) temperature = 1
        }
        // top is float in [0,1]
        if (typeof top === 'number') {
            if (top < 0) top = 0
            if (top > 1) top = 1
        }

        const res = await $.post<GPTChatRequest | GPTChatStreamRequest, Readable | GPTChatResponse>(
            `${this.api}/${VER}/chat/completions`,
            { model, messages: $.formatGPTMessage(messages), stream, temperature, top_p: top, max_tokens: maxLength },
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
            data.model = res.model
            data.object = res.object
            data.promptTokens = res.usage?.prompt_tokens || 0
            data.completionTokens = res.usage?.completion_tokens || 0
            data.totalTokens = res.usage?.total_tokens || 0
            return data
        }
    }
}
