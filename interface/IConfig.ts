/** @format */

export interface UniAIConfig {
    // OpenAI configs
    OpenAI?: {
        OPENAI_KEY?: string
        OPENAI_API?: string
    }

    // Google configs
    Google?: {
        GOOGLE_AI_KEY?: string
        GOOGLE_AI_API?: string
    }

    // GLM configs
    GLM?: {
        ZHIPU_AI_KEY?: string
        ZHIPU_AI_API?: string
    }

    // IFlyTek
    IFlyTek?: {
        FLY_APP_ID?: string
        FLY_API_KEY?: string
        FLY_API_SECRET?: string
    }

    Baidu?: {
        BAIDU_API_KEY?: string
        BAIDU_SECRET_KEY?: string
    }

    // stable diffusion (local)
    StableDiffusion?: {
        SD_API?: string
    }

    // midjourney proxy
    MidJourney?: {
        MJ_PROXY?: string
        MJ_TOKEN?: string
    }

    // other models
    Other?: {
        OTHER_API?: string
        // ...
    }
}
