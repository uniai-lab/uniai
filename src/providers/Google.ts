/** @format */

import { PassThrough, Readable } from 'stream'
import { JSONParser } from '@streamparser/json-node'
import { decodeStream } from 'iconv-lite'
import { GEMChatRequest, GEMChatResponse, GEMChatMessage } from '../../interface/IGoogle'
import { ChatRoleEnum, GEMChatRoleEnum, GoogleChatModel } from '../../interface/Enum'
import { ChatMessage, ChatResponse } from '../../interface/IModel'
import $ from '../util'
import { extname } from 'path'
import { readFileSync } from 'fs'

const API = 'https://generativelanguage.googleapis.com'
const SAFE_SET = [
    {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_NONE'
    },
    {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_NONE'
    },
    {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_NONE'
    },
    {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE'
    }
]

export default class Google {
    private key?: string | string[]
    private api: string

    /**
     * Google API client class for chat functionalities.
     * @param key - The Google API key or an array of keys.
     * @param api - The API endpoint (default: 'https://generativelanguage.googleapis.com').
     */
    constructor(key?: string | string[], api: string = API) {
        this.key = key
        this.api = api
    }

    /**
     * Sends messages to the Google Gemini chat model.
     * @param messages - An array of chat messages.
     * @param model - The model to use for chat (default: gemini-pro).
     * @param stream - Whether to use stream response (default: false).
     * @param top - Top probability to sample (optional).
     * @param temperature - Temperature for sampling (optional).
     * @param maxLength - Maximum token length for response (optional).
     * @returns A promise resolving to the chat response or a stream.
     */
    async chat(
        messages: ChatMessage[],
        model: GoogleChatModel = GoogleChatModel.GEM_PRO,
        stream: boolean = false,
        top?: number,
        temperature?: number,
        maxLength?: number
    ) {
        const key = Array.isArray(this.key) ? $.getRandomKey(this.key) : this.key
        if (!key) throw new Error('Google AI API key is not set in config')

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

        const res = await $.post<GEMChatRequest, GEMChatResponse | Readable>(
            `${this.api}/v1beta/models/${model}:${stream ? 'streamGenerateContent' : 'generateContent'}?key=${key}`,
            {
                contents: await this.formatMessage(messages),
                generationConfig: { topP: top, temperature, maxOutputTokens: maxLength },
                safetySettings: SAFE_SET
            },
            { responseType: stream ? 'stream' : 'json' }
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
            const parser = new JSONParser()

            parser.on('data', ({ value }) => {
                if (value.candidates || value.promptFeedback) {
                    const obj: GEMChatResponse = value
                    const block = obj.promptFeedback?.blockReason
                    if (block) return output.destroy(new Error(block))
                    if (!obj.candidates) return output.destroy(new Error('Google API error, no candidates'))
                    const candidate = obj.candidates[0]
                    if (!candidate.content) return output.destroy(new Error(candidate.finishReason))
                    data.content = candidate.content.parts[0].text || ''
                    data.object = `chat.completion.chunk`
                    return output.write(JSON.stringify(data))
                } else return output
            })

            parser.on('error', e => output.destroy(e))
            parser.on('end', () => output.end())

            res.pipe(decodeStream('utf-8')).pipe(parser)
            return output as Readable
        } else {
            const block = res.promptFeedback?.blockReason
            if (block) throw new Error(`Content blocked, reason: ${block}`)
            if (!res.candidates) throw new Error('Google API error, no candidates')

            const candidate = res.candidates[0]
            if (!candidate.content) throw new Error(candidate.finishReason)
            data.content = candidate.content.parts[0].text || candidate.finishReason
            data.object = `chat.completion`
            return data
        }
    }

    /**
     * Formats chat messages into GEMChatMessage format.
     * @param messages - An array of chat messages.
     * @returns A formatted array of GEMChatMessage.
     */
    private async formatMessage(messages: ChatMessage[]) {
        const prompt: GEMChatMessage[] = []
        let input = ''
        let base64: { mime: string; data: string } | null = null

        for (const { role, content, img } of messages) {
            if (!content) continue
            if (img) base64 = await this.toBase64(img)
            if (role !== ChatRoleEnum.ASSISTANT) input += `\n${content}`
            else {
                input = input.trim()
                prompt.push({
                    role: GEMChatRoleEnum.USER,
                    parts: base64
                        ? [{ text: input || ' ' }, { inline_data: { mime_type: base64.mime, data: base64.data } }]
                        : [{ text: input || ' ' }]
                })
                prompt.push({ role: GEMChatRoleEnum.MODEL, parts: [{ text: content }] })
                input = ''
            }
        }
        input = input.trim()

        if (!input) throw new Error('User input nothing')
        prompt.push({
            role: GEMChatRoleEnum.USER,
            parts: base64
                ? [{ text: input || ' ' }, { inline_data: { mime_type: base64.mime, data: base64.data } }]
                : [{ text: input || ' ' }]
        })
        // Gemini Vision currently only support 1 prompt
        return base64 ? [prompt[prompt.length - 1]] : prompt
    }

    /**
     * Convert an image to base64 format object.
     * @param img The image string to convert.
     * @returns An object containing the MIME type and base64 data.
     */
    private async toBase64(img: string): Promise<{ mime: string; data: string }> {
        let mime: string = ''
        let data: string = ''

        if ($.isBase64(img)) {
            // Handle pure base64 data
            if ($.isBase64(img, false)) {
                data = img
                mime = 'image/png'
            } else {
                const match = img.match(/^data:image\/([a-zA-Z]*);base64,([^\"']*)$/)
                if (match) {
                    mime = `image/${match[1]}`
                    data = match[2]
                }
            }
        } else if (img.startsWith('http')) {
            const res: Buffer = await $.get(img, {}, { responseType: 'arraybuffer' })
            mime = `image/${['png', 'jpg', 'jpeg', 'webp', 'heic', 'heif'].find(f => img.toLowerCase().includes(f))?.replace('jpg', 'jpeg') || 'png'}`
            data = res.toString('base64')
        } else {
            mime = `image/${extname(img).replace('.', '').toLowerCase()}`
            data = readFileSync(img).toString('base64')
        }

        if (!mime || !data) throw new Error('Can not transfer base64')

        return { mime, data }
    }
}
