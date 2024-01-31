/** @format */
import 'dotenv/config'
import '../env.d.ts'
import UniAI from '../src'
import { ModelProvider, OpenAIChatModel, OpenAIEmbedModel } from '../interface/Enum'
import { Readable } from 'stream'

const { OPENAI_KEY, OPENAI_API } = process.env

const input = 'Hi, who are you? Answer in 10 words!'

let uni: UniAI

beforeAll(() => (uni = new UniAI({ OpenAI: { key: OPENAI_KEY, proxy: OPENAI_API } })))

describe('OpenAI Tests', () => {
    test('Test list OpenAI models', () => {
        const provider = uni.models.filter(v => v.value === ModelProvider.OpenAI)[0]
        console.log(provider)
        expect(provider.models.length).toEqual(Object.values(OpenAIChatModel).length)
        expect(provider.provider).toEqual('OpenAI')
        expect(provider.value).toEqual(ModelProvider.OpenAI)
    })

    test('Test chat openai default', done => {
        uni.chat().then(console.log).catch(console.error).finally(done)
    })

    test('Test chat openai gpt-3.5-turbo', done => {
        uni.chat(input, { provider: ModelProvider.OpenAI, model: OpenAIChatModel.GPT3 })
            .then(console.log)
            .catch(console.error)
            .finally(done)
    })

    test('Test chat openai gpt-4 stream', done => {
        uni.chat(input, { stream: true, provider: ModelProvider.OpenAI, model: OpenAIChatModel.GPT4 }).then(res => {
            expect(res).toBeInstanceOf(Readable)
            const stream = res as Readable
            let data = ''
            stream.on('data', chunk => (data += JSON.parse(chunk.toString()).content))
            stream.on('end', () => console.log(data))
            stream.on('error', e => console.error(e))
            stream.on('close', () => done())
        })
    })

    test('Test OpenAI/text-embedding-ada2 embedding', done => {
        uni.embedding(input, { provider: ModelProvider.OpenAI, model: OpenAIEmbedModel.ADA2 })
            .then(res => {
                expect(res.dimension).toBe(1536)
                expect(res.embedding.length).toBe(1)
            })
            .catch(console.error)
            .finally(done)
    })
})
