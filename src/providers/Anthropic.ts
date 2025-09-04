/**
 * Utility for connecting to the Anthropic Claude model API.
 *
 * @format prettier
 * @author devilyouwei
 */
import { PassThrough, Readable } from 'stream'
import EventSourceStream from '@server-sent-stream/node'

import {
    AnthropicChatRequest,
    AnthropicChatResponse,
    AnthropicChatStreamResponse,
    AnthropicChatMessage,
    AnthropicContent,
    AnthropicTool,
    AnthropicToolChoice
} from '../../interface/IAnthropic'

import { ChatRoleEnum, AnthropicChatRoleEnum, AnthropicChatModel } from '../../interface/Enum'

import { ChatResponse, ChatMessage } from '../../interface/IModel'
import { extname } from 'path'
import { readFileSync } from 'fs'
import $ from '../util'
import { ChatCompletionFunctionTool, ChatCompletionTool, ChatCompletionToolChoiceOption } from 'openai/resources'

const API = 'https://api.anthropic.com'
const VER = 'v1'

export default class Anthropic {
    private api: string
    private key?: string | string[]

    /**
     * Constructor for the Anthropic class.
     *
     * @param key - The API key for Anthropic.
     * @param api - The API endpoint for proxy (optional).
     */
    constructor(key?: string | string[], api: string = API) {
        this.key = key
        this.api = api
    }

    /**
     * Sends messages to the Claude chat model.
     *
     * @param messages - An array of chat messages.
     * @param model - The model to use for chat (default: claude-3-5-sonnet).
     * @param stream - Whether to use stream response (default: false).
     * @param top - Top probability to sample (optional).
     * @param temperature - Temperature for sampling (optional).
     * @param maxLength - Maximum token length for response (optional).
     * @param tools - Tools for model to use (optional).
     * @param toolChoice - Controls which (if any) tool is called by the model (optional).
     * @returns A promise resolving to the chat response or a stream.
     */
    async chat(
        messages: ChatMessage[],
        model: AnthropicChatModel = AnthropicChatModel.CLAUDE_4_SONNET,
        stream: boolean = false,
        top?: number,
        temperature?: number,
        maxLength?: number,
        tools?: ChatCompletionTool[],
        toolChoice?: ChatCompletionToolChoiceOption
    ) {
        const key = Array.isArray(this.key) ? $.getRandomKey(this.key) : this.key
        if (!key) throw new Error('Anthropic API key is not set in config')

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

        const { formattedMessages, systemMessage } = await this.formatMessage(messages)
        const anthropicTools = tools ? this.formatTools(tools as ChatCompletionFunctionTool[]) : undefined
        const anthropicToolChoice = toolChoice ? this.formatToolChoice(toolChoice) : undefined

        const requestBody: AnthropicChatRequest = {
            model,
            max_tokens: maxLength || 4096,
            messages: formattedMessages,
            stream,
            temperature,
            top_p: top,
            ...(systemMessage && { system: systemMessage }),
            ...(anthropicTools && { tools: anthropicTools }),
            ...(anthropicToolChoice && { tool_choice: anthropicToolChoice })
        }

        const res = await $.post<AnthropicChatRequest, Readable | AnthropicChatResponse>(
            `${this.api}/${VER}/messages`,
            requestBody,
            {
                headers: {
                    'x-api-key': key,
                    'anthropic-version': '2023-06-01',
                    'Content-Type': 'application/json'
                },
                responseType: stream ? 'stream' : 'json'
            }
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
                const obj = $.json<AnthropicChatStreamResponse>(e.data)
                if (obj) {
                    // Handle different stream event types
                    switch (obj.type) {
                        case 'message_start':
                            if (obj.message?.usage) {
                                data.promptTokens = obj.message.usage.input_tokens
                            }
                            break
                        case 'content_block_delta':
                            if (obj.delta?.text) {
                                data.content = obj.delta.text
                                data.object = 'chat.completion.chunk'
                                output.write(JSON.stringify(data))
                            }
                            break
                        case 'message_delta':
                            if (obj.delta?.usage?.output_tokens) {
                                data.completionTokens = obj.delta.usage.output_tokens
                                data.totalTokens = data.promptTokens + data.completionTokens
                            }
                            break
                        case 'message_stop':
                            // Stream ended
                            break
                    }
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
            // Handle non-stream response
            if (res.content && res.content.length > 0) {
                const textContent = res.content.find(c => c.type === 'text')
                if (textContent) data.content = textContent.text || ''

                // Handle tool calls
                const toolUseContent = res.content.filter(c => c.type === 'tool_use')
                if (toolUseContent.length > 0) {
                    data.tools = toolUseContent.map(tool => ({
                        id: tool.id,
                        type: 'function',
                        function: {
                            name: tool.name,
                            arguments: JSON.stringify(tool.input)
                        }
                    }))
                }
            }

            data.model = res.model
            data.object = 'chat.completion'
            data.promptTokens = res.usage?.input_tokens || 0
            data.completionTokens = res.usage?.output_tokens || 0
            data.totalTokens = data.promptTokens + data.completionTokens
            return data
        }
    }

    /**
     * Formats chat messages according to the Claude model's message format.
     *
     * @param messages - An array of chat messages.
     * @returns Formatted messages and system message compatible with the Claude model.
     */
    private async formatMessage(messages: ChatMessage[]) {
        const formattedMessages: AnthropicChatMessage[] = []
        let systemMessage = ''

        for (const { role, content, img, audio } of messages) {
            // Extract system messages
            if (role === ChatRoleEnum.SYSTEM) {
                if (typeof content === 'string') systemMessage += content + '\n'
                else if (Array.isArray(content)) {
                    const contentArr = content.map(c => (typeof c === 'string' ? c : '')).filter(c => c)
                    systemMessage += contentArr.join('\n') + '\n'
                }
                continue
            }

            // Handle tool responses
            if (role === ChatRoleEnum.TOOL) {
                // Claude doesn't have a separate tool role, so we add it as user message
                formattedMessages.push({
                    role: AnthropicChatRoleEnum.USER,
                    content: `Tool result: ${content.toString()}`
                })
                continue
            }

            // Map roles
            let claudeRole: AnthropicChatRoleEnum
            switch (role) {
                case ChatRoleEnum.USER:
                    claudeRole = AnthropicChatRoleEnum.USER
                    break
                case ChatRoleEnum.ASSISTANT:
                    claudeRole = AnthropicChatRoleEnum.ASSISTANT
                    break
                default:
                    claudeRole = AnthropicChatRoleEnum.USER
                    break
            }

            // Handle messages with images
            if (img || audio || Array.isArray(content)) {
                const contentArray: AnthropicContent[] = []

                for (const text of Array.isArray(content) ? content : [content])
                    if (typeof text === 'string' && text.trim()) contentArray.push({ type: 'text', text })

                if (img) {
                    const imageContent = await this.formatImage(img)
                    if (imageContent) contentArray.push(...imageContent)
                }

                // Note: Claude doesn't support audio input directly like GPT-4o
                if (audio)
                    contentArray.push({ type: 'text', text: '[Audio input provided but not supported by Claude API]' })

                formattedMessages.push({ role: claudeRole, content: contentArray })
            } else formattedMessages.push({ role: claudeRole, content })
        }

        return { formattedMessages, systemMessage: systemMessage.trim() || undefined }
    }

    /**
     * Format image for Claude API
     * Supports: image/jpeg, image/png, image/gif, and image/webp
     */
    private async formatImage(imgs: string | string[]): Promise<AnthropicContent[]> {
        try {
            const contents: AnthropicContent[] = []

            for (const img of Array.isArray(imgs) ? imgs : [imgs]) {
                let mediaType: string = 'image/png'
                let base64Data: string = ''

                if ($.isBase64(img)) {
                    // Handle pure base64 data
                    if ($.isBase64(img, false)) {
                        base64Data = img
                        mediaType = 'image/png' // Default to PNG for pure base64
                    } else {
                        const match = img.match(/^data:image\/([a-zA-Z]*);base64,([^\"']*)$/)
                        if (match) {
                            mediaType = `image/${match[1]}`
                            base64Data = match[2]
                        }
                    }
                } else if (img.startsWith('http')) {
                    // Handle remote URLs - download and convert to base64
                    const res: Buffer = await $.get(img, {}, { responseType: 'arraybuffer' })

                    // Determine MIME type based on URL extension or default to supported formats
                    const supportedTypes = ['jpeg', 'jpg', 'png', 'gif', 'webp']
                    const detectedType = supportedTypes.find(
                        type => img.toLowerCase().includes(`.${type}`) || img.toLowerCase().includes(`/${type}`)
                    )

                    if (detectedType) mediaType = `image/${detectedType === 'jpg' ? 'jpeg' : detectedType}`
                    // Default to jpeg if type cannot be determined
                    else mediaType = 'image/jpeg'

                    base64Data = res.toString('base64')
                } else {
                    // Handle local file paths
                    const fileExtension = extname(img).replace('.', '').toLowerCase()
                    const supportedExtensions = ['jpeg', 'jpg', 'png', 'gif', 'webp']

                    if (supportedExtensions.includes(fileExtension)) {
                        mediaType = `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`
                        base64Data = readFileSync(img).toString('base64')
                    } else {
                        throw new Error(
                            `Unsupported image format: ${fileExtension}. Anthropic supports: jpeg, png, gif, webp`
                        )
                    }
                }

                // Validate that we have base64 data
                if (!base64Data) throw new Error('Failed to convert image to base64')

                // Validate media type is supported by Anthropic
                const supportedMediaTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
                if (!supportedMediaTypes.includes(mediaType)) {
                    console.warn(`Unsupported media type: ${mediaType}, defaulting to image/png`)
                    mediaType = 'image/png'
                }

                contents.push({
                    type: 'image',
                    source: { type: 'base64', media_type: mediaType, data: base64Data }
                })
            }
            return contents
        } catch (error) {
            console.warn('Failed to format image for Claude:', error)
            return []
        }
    }

    /**
     * Convert OpenAI tools format to Anthropic tools format
     */
    private formatTools(tools: ChatCompletionFunctionTool[]): AnthropicTool[] {
        return tools.map(tool => ({
            name: tool.type,
            description: tool.function.description || '',
            input_schema: {
                type: 'object',
                properties: tool.function.parameters?.properties || {},
                required: Array.isArray(tool.function.parameters?.required) ? tool.function.parameters.required : []
            }
        }))
    }

    /**
     * Convert OpenAI tool choice format to Anthropic tool choice format
     */
    private formatToolChoice(toolChoice: ChatCompletionToolChoiceOption): AnthropicToolChoice | undefined {
        if (typeof toolChoice === 'string') {
            switch (toolChoice) {
                case 'none':
                    return undefined // Claude doesn't have explicit "none" option
                case 'auto':
                    return { type: 'auto' }
                case 'required':
                    return { type: 'any' }
                default:
                    return { type: 'auto' }
            }
        } else if (typeof toolChoice === 'object' && toolChoice.type === 'function') {
            return {
                type: 'tool',
                name: toolChoice.function.name
            }
        }
        return undefined
    }
}
