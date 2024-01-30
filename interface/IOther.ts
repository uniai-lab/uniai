/** @format */

export interface OtherEmbedRequest {
    model: string
    prompt: string[]
}
export interface OtherEmbedResponse {
    model: string
    object: string
    data: number[][]
}
