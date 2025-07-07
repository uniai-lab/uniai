/** @format */

import { AnthropicChatRoleEnum } from './Enum'

export interface AnthropicChatRequest {
    model: string
    max_tokens: number
    messages: AnthropicChatMessage[]
    system?: string
    stream?: boolean
    temperature?: number
    top_p?: number
    tools?: AnthropicTool[]
    tool_choice?: AnthropicToolChoice
}

export interface AnthropicChatMessage {
    role: AnthropicChatRoleEnum
    content: string | AnthropicContent[]
}

export interface AnthropicContent {
    type: 'text' | 'image'
    text?: string
    source?: {
        type: 'base64'
        media_type: string
        data: string
    }
}

export interface AnthropicTool {
    name: string
    description: string
    input_schema: {
        type: 'object'
        properties: Record<string, any>
        required?: string[]
    }
}

export interface AnthropicToolChoice {
    type: 'auto' | 'any' | 'tool'
    name?: string
}

export interface AnthropicChatResponse {
    id: string
    type: 'message'
    role: 'assistant'
    content: AnthropicResponseContent[]
    model: string
    stop_reason?: 'end_turn' | 'max_tokens' | 'stop_sequence' | 'tool_use'
    stop_sequence?: string
    usage: {
        input_tokens: number
        output_tokens: number
    }
}

export interface AnthropicResponseContent {
    type: 'text' | 'tool_use'
    text?: string
    id?: string
    name?: string
    input?: any
}

export interface AnthropicChatStreamResponse {
    type: 'message_start' | 'message_delta' | 'content_block_start' | 'content_block_delta' | 'content_block_stop' | 'message_stop'
    message?: Partial<AnthropicChatResponse>
    delta?: {
        text?: string
        type?: string
        stop_reason?: string
        usage?: {
            output_tokens: number
        }
    }
    content_block?: {
        type: 'text' | 'tool_use'
        text?: string
        id?: string
        name?: string
        input?: any
    }
    index?: number
}
