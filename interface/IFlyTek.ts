/** @format */

// spark chat model request interface
export interface SPKChatRequest {
    header: {
        app_id: string
        uid?: string
    }
    parameter: {
        chat: {
            domain: string
            temperature?: number
            max_tokens?: number
            top_k?: number
            chat_id?: number
        }
    }
    payload: {
        message: {
            text: SPKChatMessage[]
        }
    }
}

interface SystemMessage {
    role: 'system'
    content: string
}
interface UserMessage {
    role: 'user'
    content: string
}
interface AssistantMessage {
    role: 'assistant'
    content: string
}

export type SPKChatMessage = SystemMessage | AssistantMessage | UserMessage

// spark chat model response interface
export interface SPKChatResponse {
    header: {
        code: number
        message: string
        sid: string
        status: number
    }
    payload?: {
        choices?: {
            status: number
            seq: number
            text: [
                {
                    content: string
                    role: string
                    index: number
                }
            ]
        }
        usage?: {
            text: {
                question_tokens: number
                prompt_tokens: number
                completion_tokens: number
                total_tokens: number
            }
        }
    }
}

export interface SPKImagineRequest {
    header: {
        app_id: string
        uid?: string
    }
    parameter: {
        chat: {
            domain: string
            width: number
            height: number
        }
    }
    payload: {
        message: {
            text: {
                role: string
                content: string
            }[]
        }
    }
}

// 错误码	错误信息
// 0	成功
// 10003	用户的消息格式有错误
// 10004	用户数据的schema错误
// 10005	用户参数值有错误
// 10008	服务容量不足
// 10021	输入审核不通过
// 10022	模型生产的图片涉及敏感信息，审核不通过

export interface SPKImagineResponse {
    header: {
        code: number
        message: string
        sid: string
        status: number
    }
    payload?: {
        choices: {
            status: number
            seq: number
            text: [
                {
                    content: string
                    index: number
                    role: string
                }
            ]
        }
    }
}
