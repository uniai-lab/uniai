/** @format */

export interface UniAIConfig {
    // OpenAI configs
    OpenAI?: {
        key: string | string[]
        proxy?: string
    }

    // Google configs
    Google?: {
        key: string | string[]
        proxy?: string
    }

    // GLM configs
    GLM?: {
        key?: string | string[]
        local?: string
        proxy?: string
    }

    // IFlyTek
    IFlyTek?: {
        appId: string
        apiKey: string
        apiSecret: string
        proxy?: string
    }

    Baidu?: {
        appId?: string
        apiKey: string
        secretKey: string
        proxy?: string
    }

    MoonShot?: {
        key: string | string[]
        proxy?: string
    }

    // stable diffusion (local)
    StableDiffusion?: {
        api: string
    }

    // midjourney proxy
    MidJourney?: {
        proxy: string
        token?: string
    }

    // other models
    Other?: {
        api?: string
        // ...
    }
}
