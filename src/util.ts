/**
 * @author devilyouwei
 * @format prettier
 * Utils for UniAI
 **/

import { writeFileSync } from 'fs'
import axios, { AxiosRequestConfig } from 'axios'
import { LocalStorage } from 'node-localstorage'
import path from 'path'
import isBase64 from 'is-base64'
import { ChatCompletionContentPart, ChatCompletionContentPartText } from 'openai/resources'
import { ChatMessage } from '../interface/IModel'
import { GPTChatMessage } from '../interface/IOpenAI'
import { ChatRoleEnum } from '../interface/Enum'

// Initialize local storage
const localStorage = new LocalStorage('./cache', Infinity)

export default {
    /**
     * Performs an HTTP GET request.
     *
     * @param url - The URL to make the request to.
     * @param params - Optional request parameters.
     * @param config - Optional Axios request configuration.
     * @returns A Promise that resolves with the response data.
     */
    async get<RequestT, ResponseT>(url: string, params?: RequestT, config?: AxiosRequestConfig) {
        return (await axios.get<ResponseT>(url, { params, ...config })).data
    },

    /**
     * Performs an HTTP POST request.
     *
     * @param url - The URL to make the request to.
     * @param body - The request body.
     * @param config - Optional Axios request configuration.
     * @returns A Promise that resolves with the response data.
     */
    async post<RequestT, ResponseT>(url: string, body?: RequestT, config?: AxiosRequestConfig) {
        return (await axios.post<ResponseT>(url, body, config)).data
    },
    /**
     * Parses JSON from a string and returns it as a generic type T.
     *
     * @param str - The JSON string to parse.
     * @returns The parsed JSON as a generic type T.
     */
    json<T>(str?: string | null) {
        try {
            if (!str) return null
            return JSON.parse(str) as T
        } catch (e) {
            return null
        }
    },
    getRandomKey<T>(arr: T[]): T {
        return arr[Math.floor(Math.random() * arr.length)]
    },
    getRandomId(length = 16): string {
        let result = ''
        while (result.length < length) {
            let rand = Math.floor(Math.random() * 10)
            // Ensure the number doesn't start with zero
            if (result.length === 0 && rand === 0) continue
            // Append the number to the result string
            result += rand.toString()
        }
        return result
    },
    /**
     * Computes the greatest common divisor (GCD) of two numbers using Euclidean algorithm.
     *
     * @param a - The first number.
     * @param b - The second number.
     * @returns The GCD of the two numbers.
     */
    getGCD(a: number, b: number): number {
        if (b === 0) return a
        return this.getGCD(b, a % b)
    },
    /**
     * Calculates and returns the aspect ratio of a width and height.
     *
     * @param width - The width dimension.
     * @param height - The height dimension.
     * @returns The aspect ratio in the format "width:height".
     */
    getAspect(width: number, height: number) {
        if (!width || !height) return '1:1'

        const gcd = this.getGCD(width, height)
        const aspectRatioWidth = width / gcd
        const aspectRatioHeight = height / gcd

        return `${aspectRatioWidth}:${aspectRatioHeight}`
    },
    /**
     * Stores an item in local storage with the specified key.
     *
     * @param key - The key under which to store the item.
     * @param value - The value to be stored.
     */
    setItem<T>(key: string, value: T) {
        localStorage.setItem(key, JSON.stringify(value))
    },
    /**
     * Retrieves an item from local storage by its key and parses it as a generic type T.
     *
     * @param key - The key of the item to retrieve.
     * @returns The parsed item as a generic type T.
     */
    getItem<T>(key: string) {
        return this.json<T>(localStorage.getItem(key))
    },
    /**
     * This method is used to write given data to a file. The data can either be a base64 string or an HTTP/HTTPS URL.
     * If the data is a URL, the method fetches the data as a readable stream and writes it to the file.
     * If it's a base64 string, it writes it directly to the file.
     * @param data - The data to be written to the file. Can be a base64 string or a HTTP/HTTPS img URL.
     * @param filename - The name of the file where the data will be written. If not provided, a unique filename will be generated.
     * @returns - The file path where the data was written.
     */
    async writeFile(data: string, filename = '') {
        // Generate a unique filename for the output
        const filepath = path.join('./cache', filename)

        if (data.startsWith('http://') || data.startsWith('https://')) {
            // Use the get method to fetch the image
            const res: Buffer = await this.get(data, {}, { responseType: 'arraybuffer' })
            if (!(res instanceof Buffer)) throw new Error('Img is not a buffer')
            // write to file
            writeFileSync(filepath, res)
        } else writeFileSync(filepath, Buffer.from(data, 'base64'))

        return filepath
    },

    isBase64(data: string, allowMime: boolean = true) {
        return isBase64(data, { allowMime })
    },
    /**
     * Formats chat messages according to the GPT model's message format.
     *
     * @param messages - An array of chat messages.
     * @returns Formatted messages compatible with the GPT model.
     */
    formatGPTMessage(messages: ChatMessage[]) {
        const prompt: GPTChatMessage[] = []

        for (const { role, content, img, tool, audio } of messages) {
            // support string content and multi part content
            let contentArr: string | ChatCompletionContentPart[] = []

            // handle multi modal and user multi part content
            if (img || audio || Array.isArray(content)) {
                for (const text of Array.isArray(content) ? content : [content])
                    if (text.trim()) contentArr.push({ type: 'text', text })

                if (img)
                    for (const url of Array.isArray(img) ? img : [img])
                        contentArr.push({ type: 'image_url', image_url: { url } })

                if (audio)
                    for (const data of Array.isArray(audio) ? audio : [audio])
                        contentArr.push({ type: 'input_audio', input_audio: { data, format: 'wav' } })
            } else contentArr = content

            // with image
            switch (role) {
                case ChatRoleEnum.USER:
                    prompt.push({ role, content: contentArr })
                    break
                case ChatRoleEnum.TOOL:
                    // remove non-text part for tool role
                    let contentTool: string | Array<ChatCompletionContentPartText> = ''
                    if (Array.isArray(contentArr))
                        contentTool = contentArr.filter(v => v.type === 'text') as ChatCompletionContentPartText[]
                    else contentTool = contentArr
                    prompt.push({ role, content: contentTool, tool_call_id: tool || '' })
                    break
                case ChatRoleEnum.DEV:
                    let contentDev: string | Array<ChatCompletionContentPartText> = ''
                    if (Array.isArray(contentArr))
                        contentDev = contentArr.filter(v => v.type === 'text') as ChatCompletionContentPartText[]
                    else contentDev = contentArr
                    prompt.push({ role, content: contentDev })
                    break
                default:
                    // system and assistant role
                    prompt.push({ role, content: content as string })
                    break
            }
        }

        return prompt
    }
}
