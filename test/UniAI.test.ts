/** @format */
import 'dotenv/config'
import UniAI from '../src'
import { Logger } from 'tslog'
import {
    BaiduChatModel,
    GLMChatModel,
    GoogleChatModel,
    IFlyTekChatModel,
    ModelProvider,
    OpenAIChatModel,
    OpenAIEmbedModel,
    OtherEmbedModel
} from '../interface/Enum'
import { Readable } from 'stream'
const {
    OPENAI_KEY,
    OPENAI_API,
    OTHER_API,
    GOOGLE_AI_KEY,
    GOOGLE_AI_API,
    ZHIPU_AI_KEY,
    ZHIPU_AI_API,
    FLY_APP_ID,
    FLY_API_KEY,
    FLY_API_SECRET,
    BAIDU_API_KEY,
    BAIDU_SECRET_KEY
    // STABLE_DIFFUSION_API,
    // MID_JOURNEY_API,
    // MID_JOURNEY_TOKEN
} = process.env

const console = new Logger()

const input = 'hello, who are you? Answer in 10 words'

test('Test list providers and models', async () => {
    const uni = new UniAI()
    const res = uni.models
    console.silly(res)
})

test('Test chat openai default', async () => {
    const uni = new UniAI({ OpenAI: { OPENAI_KEY, OPENAI_API } })
    const res = await uni.chat()
    console.silly(res)
})

test('Test chat GLM chatglm-6b', async () => {
    const uni = new UniAI({ Other: { OTHER_API } })
    const res = await uni.chat(input, { provider: ModelProvider.GLM, model: GLMChatModel.GLM_6B })
    console.silly(res)
})

test('Test chat iFlyTek v3.1', async () => {
    const uni = new UniAI({ IFlyTek: { FLY_API_KEY, FLY_API_SECRET, FLY_APP_ID } })
    const res = await uni.chat(input, { provider: ModelProvider.IFlyTek, model: IFlyTekChatModel.SPARK_V3 })
    console.silly(res)
})

test('Test chat Baidu wenxin', async () => {
    const uni = new UniAI({ Baidu: { BAIDU_API_KEY, BAIDU_SECRET_KEY } })
    const res = await uni.chat(input, { provider: ModelProvider.Baidu, model: BaiduChatModel.ERNIE4 })
    console.silly(res)
})

test('Test chat ZhiPU GLM 3 turbo', async () => {
    const uni = new UniAI({ GLM: { ZHIPU_AI_KEY, ZHIPU_AI_API } })
    const res = await uni.chat(input, { provider: ModelProvider.GLM, model: GLMChatModel.GLM_3_TURBO })
    console.silly(res)
})

test('Test chat Google gemini', async () => {
    const uni = new UniAI({ Google: { GOOGLE_AI_API, GOOGLE_AI_KEY } })
    const res = await uni.chat(input, { provider: ModelProvider.Google, model: GoogleChatModel.GEM_PRO })
    console.silly(res)
})

test('Test chat gpt-4 stream', done => {
    const uni = new UniAI({ OpenAI: { OPENAI_KEY, OPENAI_API } })
    uni.chat(input, { stream: true, provider: ModelProvider.OpenAI, model: OpenAIChatModel.GPT4 }).then(res => {
        expect(res).toBeInstanceOf(Readable)
        const stream = res as Readable
        let data = ''
        stream.on('data', chunk => (data += JSON.parse(chunk.toString()).content))
        stream.on('end', () => console.silly(data))
        stream.on('close', done)
    })
})

test('Test chat local chatglm-6b stream', done => {
    const uni = new UniAI({ Other: { OTHER_API } })
    uni.chat(input, { stream: true, provider: ModelProvider.GLM, model: GLMChatModel.GLM_6B }).then(res => {
        expect(res).toBeInstanceOf(Readable)
        const stream = res as Readable
        let data = ''
        stream.on('data', chunk => (data += JSON.parse(chunk.toString()).content))
        stream.on('end', () => console.silly(data))
        stream.on('close', done)
    })
})

test('Test chat IflyTek stream', done => {
    const uni = new UniAI({ IFlyTek: { FLY_API_KEY, FLY_API_SECRET, FLY_APP_ID } })
    uni.chat(input, { stream: true, provider: ModelProvider.IFlyTek, model: IFlyTekChatModel.SPARK_V1 }).then(res => {
        expect(res).toBeInstanceOf(Readable)
        const stream = res as Readable
        let data = ''
        stream.on('data', chunk => (data += JSON.parse(chunk.toString()).content))
        stream.on('end', () => console.silly(data))
        stream.on('close', done)
    })
})

test('Test chat Baidu stream', done => {
    const uni = new UniAI({ Baidu: { BAIDU_API_KEY, BAIDU_SECRET_KEY } })
    uni.chat(input, { stream: true, provider: ModelProvider.Baidu, model: BaiduChatModel.ERNIE_TURBO }).then(res => {
        expect(res).toBeInstanceOf(Readable)
        const stream = res as Readable
        let data = ''
        stream.on('data', chunk => (data += JSON.parse(chunk.toString()).content))
        stream.on('end', () => console.silly(data))
        stream.on('close', done)
    })
})

test('Test chat ZhiPu GLM-4 stream', done => {
    const uni = new UniAI({ GLM: { ZHIPU_AI_KEY, ZHIPU_AI_API } })
    uni.chat(input, { stream: true, provider: ModelProvider.GLM, model: GLMChatModel.GLM_4 }).then(res => {
        expect(res).toBeInstanceOf(Readable)
        const stream = res as Readable
        let data = ''
        stream.on('data', chunk => (data += JSON.parse(chunk.toString()).content))
        stream.on('end', () => console.silly(data))
        stream.on('close', done)
    })
})

test('Test google gemini stream', done => {
    const uni = new UniAI({ Google: { GOOGLE_AI_API, GOOGLE_AI_KEY } })
    uni.chat(input, { stream: true, provider: ModelProvider.Google, model: GoogleChatModel.GEM_PRO }).then(res => {
        expect(res).toBeInstanceOf(Readable)
        const stream = res as Readable
        let data = ''
        stream.on('data', chunk => (data += JSON.parse(chunk.toString()).content))
        stream.on('end', () => console.silly(data))
        stream.on('close', done)
    })
})

// Embedding------------------------------------------------------------------------------
test('Test OpenAI/text-embedding-ada2 embedding', async () => {
    const uni = new UniAI({ OpenAI: { OPENAI_KEY, OPENAI_API } })
    const res = await uni.embedding(input, { provider: ModelProvider.OpenAI, model: OpenAIEmbedModel.ADA2 })
    expect(res.embedding.length).toBe(1)
    expect(res.dimension).toBe(1536)
})

test('Test Other Other/text2vec embedding', async () => {
    const uni = new UniAI({ Other: { OTHER_API } })
    const res = await uni.embedding(input, { provider: ModelProvider.Other, model: OtherEmbedModel.LARGE_CHN })
    expect(res.embedding.length).toBe(1)
    expect(res.dimension).toBe(1024)
})
