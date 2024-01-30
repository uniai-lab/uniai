/** @format */
import {
    BaiduChatModel,
    ChatModel,
    ChatRoleEnum,
    GLMChatModel,
    GoogleChatModel,
    IFlyTekChatModel,
    ModelProvider,
    OpenAIChatModel,
    OpenAIEmbedModel,
    OtherChatModel,
    OtherEmbedModel
} from '../interface/Enum'
import { UniAIConfig } from '../interface/IConfig'
import { ChatMessage, ChatOption, EmbedOption, ModelList, Provider } from '../interface/IModel'
import OpenAI from './providers/OpenAI'
import GLM from './providers/GLM'
import Other from './providers/Other'
import Google from './providers/Google'
import IFlyTek from './providers/IFlyTek'
import Baidu from './providers/Baidu'

const DEFAULT_MESSAGE = 'Hello, who are you? Answer me in 10 words!'

export default class UniAI {
    public config: UniAIConfig | null = null
    public models: ModelList

    private openai: OpenAI
    private google: Google
    private glm: GLM
    private fly: IFlyTek
    private baidu: Baidu
    private other: Other

    constructor(config: UniAIConfig = {}) {
        this.config = config
        // OpenAI key, your OpenAI proxy API (optional)
        this.openai = new OpenAI(config.OpenAI?.OPENAI_KEY, config.OpenAI?.OPENAI_API)
        // ZhiPu AI with ChatGLM6B(local)
        this.glm = new GLM(config.GLM?.ZHIPU_AI_KEY, config.Other?.OTHER_API, config.GLM?.ZHIPU_AI_API)
        // Other model text2vec
        this.other = new Other(config.Other?.OTHER_API)
        // Google AI key, your Google AI API proxy (optional)
        this.google = new Google(config.Google?.GOOGLE_AI_KEY, config.Google?.GOOGLE_AI_API)
        // IFlyTek appid, API key, API secret
        this.fly = new IFlyTek(config.IFlyTek?.FLY_APP_ID, config.IFlyTek?.FLY_API_KEY, config.IFlyTek?.FLY_API_SECRET)
        // Baidu Wenxin Workshop, baidu api key, baidu secret key
        this.baidu = new Baidu(config.Baidu?.BAIDU_API_KEY, config.Baidu?.BAIDU_SECRET_KEY)

        // expand models to list
        this.models = Object.entries(ModelProvider).map<Provider>(([k, v]) => ({
            provider: k as keyof typeof ModelProvider,
            value: v,
            models: Object.values(
                {
                    [ModelProvider.OpenAI]: OpenAIChatModel,
                    [ModelProvider.Baidu]: BaiduChatModel,
                    [ModelProvider.IFlyTek]: IFlyTekChatModel,
                    [ModelProvider.GLM]: GLMChatModel,
                    [ModelProvider.Google]: GoogleChatModel,
                    [ModelProvider.Other]: OtherChatModel
                }[v]
            ) as ChatModel[]
        }))
    }

    async chat(messages: ChatMessage[] | string = DEFAULT_MESSAGE, option: ChatOption = {}) {
        if (typeof messages === 'string') messages = [{ role: ChatRoleEnum.USER, content: messages }]
        const provider = option.provider || ModelProvider.OpenAI // default is OpenAI gpt-3.5-turbo
        const { model, stream, top, temperature, maxLength } = option

        if (provider === ModelProvider.OpenAI)
            return await this.openai.chat(messages, model as OpenAIChatModel, stream, top, temperature, maxLength)
        else if (provider === ModelProvider.Google)
            return await this.google.chat(messages, model as GoogleChatModel, stream, top, temperature, maxLength)
        else if (provider === ModelProvider.GLM)
            return await this.glm.chat(messages, model as GLMChatModel, stream, top, temperature, maxLength)
        else if (provider === ModelProvider.IFlyTek)
            return await this.fly.chat(messages, model as IFlyTekChatModel, stream, top, temperature, maxLength)
        else if (provider === ModelProvider.Baidu)
            return await this.baidu.chat(messages, model as BaiduChatModel, stream, top, temperature, maxLength)
        else throw new Error('Chat model Provider not found')
    }

    async embedding(content: string | string[], option?: EmbedOption) {
        const provider = option?.provider || ModelProvider.OpenAI
        if (typeof content === 'string') content = [content]

        if (provider === ModelProvider.OpenAI)
            return await this.openai.embedding(content, option?.model as OpenAIEmbedModel)
        else if (provider === ModelProvider.Other)
            return await this.other.embedding(content, option?.model as OtherEmbedModel)
        else throw new Error('Embedding model provider not found')
    }
}
