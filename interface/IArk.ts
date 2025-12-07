/** @format */

import { GPTChatRequest, GPTChatStreamRequest } from './IOpenAI'

export type ARKReasoningEffort = 'minimal' | 'low' | 'medium' | 'high'

export interface ARKThinkingConfig {
    type: 'enabled' | 'disabled'
}

export interface ARKReasoningConfig {
    effort: ARKReasoningEffort
}

export interface ARKChatRequest extends GPTChatRequest {
    stream?: false
    thinking?: ARKThinkingConfig
    reasoning?: ARKReasoningConfig
}

export interface ARKChatRequestStream extends GPTChatStreamRequest {
    stream: true
    thinking?: ARKThinkingConfig
    reasoning?: ARKReasoningConfig
}
