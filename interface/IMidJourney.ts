/** @format */

import { MJTaskType } from './Enum'

export interface MJImagineRequest {
    prompt: string
    base64Array?: string[]
    notifyHook?: string
    state?: string
}
export interface MJChangeRequest {
    taskId: string
    action: MJTaskType
    index?: number
    notifyHook?: string
    state?: string
}

export interface MJImagineResponse {
    code: number
    description: string
    result: string
    properties: {
        discordInstanceId: string
    }
}

export interface MJTaskResponse {
    id: string
    properties?: {
        notifyHook: string
        discordInstanceId?: string
        flags: number
        messageId: string
        messageHash: string
        nonce: string
        finalPrompt: string
        progressMessageId: string
    }
    action: MJTaskType
    status: string
    prompt: string
    promptEn: string
    description: string
    state: string
    submitTime: number
    startTime: number
    finishTime: number
    imageUrl: string | null
    progress: string
    failReason: string | null
}
