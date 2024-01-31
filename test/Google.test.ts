/** @format */
import 'dotenv/config'
import '../env.d.ts'
import UniAI from '../src'
import { ModelProvider, GoogleChatModel } from '../interface/Enum'
import { Readable } from 'stream'

const { GOOGLE_AI_API, GOOGLE_AI_KEY } = process.env

const input = 'Hi, who are you? Answer in 10 words!'

let uni: UniAI

beforeAll(() => (uni = new UniAI({ Google: { key: GOOGLE_AI_KEY, proxy: GOOGLE_AI_API } })))

describe('Google Tests', () => {
    test('Test list Google models', () => {
        const provider = uni.models.filter(v => v.value === ModelProvider.Google)[0]
        console.log(provider)
        expect(provider.provider).toEqual('Google')
        expect(provider.models.length).toEqual(Object.values(GoogleChatModel).length)
        expect(provider.value).toEqual(ModelProvider.Google)
    })

    test('Test chat Google gemini', done => {
        uni.chat(input, { provider: ModelProvider.Google, model: GoogleChatModel.GEM_PRO })
            .then(console.log)
            .catch(console.error)
            .finally(done)
    })

    test('Test chat Google gemini stream', done => {
        uni.chat(input, { stream: true, provider: ModelProvider.Google, model: GoogleChatModel.GEM_PRO }).then(res => {
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
