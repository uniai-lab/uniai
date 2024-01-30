/** @format */

import jwt from 'jsonwebtoken'
import { PassThrough, Readable } from 'stream'
import EventSourceStream from '@server-sent-stream/node'
import { decodeStream } from 'iconv-lite'
import { LocalStorage } from 'node-localstorage'
import { GLMChatMessage, GLMChatRequest, GLMChatResponse, GLMTokenCache } from '../../interface/IGLM'
import { ChatRoleEnum, GLMChatModel, GLMChatRoleEnum } from '../../interface/Enum'
import { ChatMessage, ChatResponse } from '../../interface/IModel'
import $ from '../util'

const localStorage = new LocalStorage('./cache')

const EXPIRE = 3 * 60 * 1000
const TURBO_API = 'https://open.bigmodel.cn'

export default class GLM {
    private key?: string
    private localAPI?: string
    private turboAPI: string

    constructor(key?: string, localAPI?: string, turboAPI: string = TURBO_API) {
        this.key = key
        this.localAPI = localAPI
        this.turboAPI = turboAPI
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
        model: GLMChatModel = GLMChatModel.GLM_6B,
        stream: boolean = false,
        top?: number,
        temperature?: number,
        maxLength?: number
    ) {
        if (!Object.values(GLMChatModel).includes(model)) throw new Error('GLM chat model not found')

        const data: ChatResponse = {
            content: '',
            model,
            object: '',
            promptTokens: 0,
            completionTokens: 0,
            totalTokens: 0
        }

        if (model === GLMChatModel.GLM_6B) {
            if (!this.localAPI) throw new Error('Local ChatGLM-6B API is not set in config')

            const res = await $.post<GLMChatRequest, Readable | GLMChatResponse>(
                `${this.localAPI}/chat`,
                { messages: this.formatMessage(messages), stream, temperature, top_p: top, max_tokens: maxLength },
                { responseType: stream ? 'stream' : 'json' }
            )
            if (res instanceof Readable) {
                const output = new PassThrough()
                const parser = new EventSourceStream()
                parser.on('data', (e: MessageEvent) => {
                    const obj = $.json<GLMChatResponse>(e.data)
                    if (obj?.choices[0].delta?.content) {
                        data.content = obj.choices[0].delta.content
                        data.object = 'chat.completion.chunk'
                        data.promptTokens = obj.usage?.prompt_tokens || 0
                        data.completionTokens = obj.usage?.completion_tokens || 0
                        data.totalTokens = obj.usage?.total_tokens || 0
                        output.write(JSON.stringify(data))
                    }
                })

                parser.on('error', e => output.destroy(e))
                parser.on('end', () => output.end())

                res.pipe(decodeStream('utf-8')).pipe(parser)
                return output as Readable
            } else {
                data.content = res.choices[0].message?.content || ''
                data.object = 'chat.completion'
                data.promptTokens = res.usage?.prompt_tokens || 0
                data.completionTokens = res.usage?.completion_tokens || 0
                data.totalTokens = res.usage?.total_tokens || 0
                return data
            }
        } else {
            if (!this.key) throw new Error('ChatGLM-turbo zhipu API key is not in config')

            const token = this.generateToken(this.key)
            const res = await $.post<GLMChatRequest, Readable | GLMChatResponse>(
                `${this.turboAPI}/api/paas/v4/chat/completions`,
                {
                    model,
                    messages: this.formatMessage(messages),
                    stream,
                    temperature,
                    top_p: top,
                    max_tokens: maxLength
                },
                { headers: { Authorization: token }, responseType: stream ? 'stream' : 'json' }
            )

            if (res instanceof Readable) {
                const output = new PassThrough()
                const parser = new EventSourceStream()

                parser.on('data', (e: MessageEvent) => {
                    const obj = $.json<GLMChatResponse>(e.data)
                    if (obj?.choices[0].delta?.content) {
                        data.content = obj.choices[0].delta.content
                        data.object = 'chat.completion.chunk'
                        data.promptTokens = obj.usage?.prompt_tokens || 0
                        data.completionTokens = obj.usage?.completion_tokens || 0
                        data.totalTokens = obj.usage?.total_tokens || 0
                        output.write(JSON.stringify(data))
                    }
                })

                parser.on('error', e => output.destroy(e))
                parser.on('end', () => output.end())

                res.pipe(decodeStream('utf-8')).pipe(parser)
                return output as Readable
            } else {
                data.content = res.choices[0].message?.content || ''
                data.object = 'chat.completion'
                data.promptTokens = res.usage?.prompt_tokens || 0
                data.completionTokens = res.usage?.completion_tokens || 0
                data.totalTokens = res.usage?.total_tokens || 0
                return data
            }
        }
    }

    /**
     * Generates a JWT token for authorization.
     *
     * @param key - The API key.
     * @param expire - Token expiration time in milliseconds.
     * @returns The generated JWT token.
     */
    private generateToken(key: string, expire: number = EXPIRE) {
        const [id, secret] = key.split('.')
        const timestamp = Date.now()

        // check existed token cache
        const cache = $.json<GLMTokenCache>(localStorage.getItem('glm'))
        if (cache && timestamp - cache.timestamp < expire) return cache.token

        /// @ts-ignore
        const token = jwt.sign({ api_key: id, timestamp, exp: timestamp + expire }, secret, {
            header: { alg: 'HS256', sign_type: 'SIGN' }
        })

        localStorage.setItem('glm', JSON.stringify({ token, timestamp }))
        return token
    }

    /**
     * Formats chat messages according to the GLM model's message format.
     *
     * @param messages - An array of chat messages.
     * @returns Formatted messages compatible with the GLM model.
     */
    private formatMessage(messages: ChatMessage[]) {
        const prompt: GLMChatMessage[] = []

        for (const { role, content } of messages)
            if (role === ChatRoleEnum.FUNCTION) continue
            else prompt.push({ role, content })

        if (prompt[prompt.length - 1].role !== GLMChatRoleEnum.USER) throw new Error('User input nothing')
        return prompt
    }
}
