/** @format */
import 'dotenv/config'
import '../env.d.ts'
import UniAI from '../src'
import { ModelProvider, GLMChatModel } from '../interface/Enum'
import { Readable } from 'stream'

const { GLM_API, ZHIPU_AI_API, ZHIPU_AI_KEY } = process.env

const input = 'Hi, who are you? Answer in 10 words!'

let uni: UniAI

beforeAll(() => (uni = new UniAI({ GLM: { key: ZHIPU_AI_KEY, proxy: ZHIPU_AI_API, local: GLM_API } })))

describe('GLM Tests', () => {
    test('Test list GLM models', () => {
        const provider = uni.models.filter(v => v.value === ModelProvider.GLM)[0]
        console.log(provider)
        expect(provider.provider).toEqual('GLM')
        expect(provider.models.length).toEqual(Object.values(GLMChatModel).length)
        expect(provider.value).toEqual(ModelProvider.GLM)
    })

    test('Test chat local chatglm3-6b-32k', done => {
        uni.chat(input, { provider: ModelProvider.GLM, model: GLMChatModel.GLM_6B })
            .then(console.log)
            .catch(console.error)
            .finally(done)
    })

    test('Test chat ZhiPu glm-3-turbo', done => {
        uni.chat(input, { provider: ModelProvider.GLM, model: GLMChatModel.GLM_3_TURBO })
            .then(console.log)
            .catch(console.error)
            .finally(done)
    })

    test('Test chat ZhiPu glm-4 stream', done => {
        uni.chat(input, { stream: true, provider: ModelProvider.GLM, model: GLMChatModel.GLM_4 }).then(res => {
            expect(res).toBeInstanceOf(Readable)
            const stream = res as Readable
            let data = ''
            stream.on('data', chunk => (data += JSON.parse(chunk.toString()).content))
            stream.on('end', () => console.log(data))
            stream.on('error', e => console.error(e))
            stream.on('close', () => done())
        })
    })
})
