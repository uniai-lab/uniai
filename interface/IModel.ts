/** @format */

import {
    EmbedModel,
    ChatModel,
    ChatRoleEnum,
    ModelProvider,
    ImagineModel,
    ChatModelProvider,
    ImagineModelProvider
} from './Enum'

export interface ChatMessage {
    role: ChatRoleEnum
    content: string
}

export interface EmbeddingResponse {
    embedding: number[][]
    dimension: number
    model: EmbedModel
    object: 'embedding'
    promptTokens: number
    totalTokens: number
}

export interface ChatResponse {
    content: string
    promptTokens: number
    completionTokens: number
    totalTokens: number
    model: ChatModel | string
    object: string
}

export interface ChatOption {
    stream?: boolean
    provider?: ChatModelProvider
    model?: ChatModel
    top?: number
    temperature?: number
    maxLength?: number
}

export interface EmbedOption {
    provider?: ModelProvider
    model?: EmbedModel
}

export type ModelList = Provider[]

export interface Provider {
    provider: keyof typeof ModelProvider
    value: ModelProvider
    models: ChatModel[] // 假设 models 为字符串数组
}

export interface ImagineOption {
    provider?: ImagineModelProvider
    model?: ImagineModel
    negativePrompt?: string
    height?: number
    width?: number
    num?: number
}

export interface ImagineResponse {
    taskId: string
    time: Date
}

export interface TaskResponse {
    id: string
    imgs: string[]
    info: string
    fail: string
    progress: number
    created: Date
    model: ImagineModel
}
