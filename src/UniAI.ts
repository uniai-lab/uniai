/** @format */
import {
    BaiduChatModel,
    ChatModel,
    ChatRoleEnum,
    GLMChatModel,
    GoogleChatModel,
    IFlyTekChatModel,
    ModelProvider,
    MoonShotChatModel,
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
import MoonShot from './providers/MoonShot'

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
    private moon: MoonShot

    constructor(config: UniAIConfig = {}) {
        this.config = config
        // OpenAI key, your OpenAI proxy API (optional)
        this.openai = new OpenAI(config.OpenAI?.key, config.OpenAI?.proxy)
        // ZhiPu AI with ChatGLM6B(local)
        this.glm = new GLM(config.GLM?.key, config.GLM?.local, config.GLM?.proxy)
        // Google AI key, your Google AI API proxy (optional)
        this.google = new Google(config.Google?.key, config.Google?.proxy)
        // IFlyTek appid, API key, API secret
        this.fly = new IFlyTek(config.IFlyTek?.appId, config.IFlyTek?.apiKey, config.IFlyTek?.apiSecret)
        // Baidu WenXin Workshop, baidu api key, baidu secret key
        this.baidu = new Baidu(config.Baidu?.apiKey, config.Baidu?.secretKey, config.Baidu?.proxy)
        // MoonShot, moonshot API key
        this.moon = new MoonShot(config.MoonShot?.key, config.MoonShot?.proxy)
        // Other model text2vec
        this.other = new Other(config.Other?.api)

        // expand models to list
        this.models = Object.entries(ModelProvider).map<Provider>(([k, v]) => ({
            provider: k as keyof typeof ModelProvider,
            value: v,
            models: Object.values<ChatModel>(
                ({
                    [ModelProvider.OpenAI]: OpenAIChatModel,
                    [ModelProvider.Baidu]: BaiduChatModel,
                    [ModelProvider.IFlyTek]: IFlyTekChatModel,
                    [ModelProvider.GLM]: GLMChatModel,
                    [ModelProvider.Google]: GoogleChatModel,
                    [ModelProvider.Other]: OtherChatModel,
                    [ModelProvider.MoonShot]: MoonShotChatModel
                }[v] as typeof ChatModel) || {}
            )
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
        else if (provider === ModelProvider.MoonShot)
            return await this.moon.chat(messages, model as MoonShotChatModel, stream, top, temperature, maxLength)
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
