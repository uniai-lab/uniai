/** @format */

import type { ChatCompletionChunk } from 'openai/resources.js'

export interface AliStreamResponse extends ChatCompletionChunk {
    error?: {
        code: string
        message: string
        param: null
        type: string
    }
}
