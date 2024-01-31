/** @format */
import 'dotenv/config'
import '../env.d.ts'
import UniAI from '../src'
import { ModelProvider, BaiduChatModel } from '../interface/Enum'
import { Readable } from 'stream'

const { BAIDU_API_KEY, BAIDU_SECRET_KEY, BAIDU_API } = process.env

const input = 'Hi, who are you? Answer in 10 words!'

let uni: UniAI

beforeAll(() => (uni = new UniAI({ Baidu: { apiKey: BAIDU_API_KEY, secretKey: BAIDU_SECRET_KEY, proxy: BAIDU_API } })))

describe('Baidu Tests', () => {
    test('Test list Baidu models', () => {
        const provider = uni.models.filter(v => v.value === ModelProvider.Baidu)[0]
        console.log(provider)
        expect(provider.provider).toEqual('Baidu')
        expect(provider.models.length).toEqual(Object.values(BaiduChatModel).length)
        expect(provider.value).toEqual(ModelProvider.Baidu)
    })

    test('Test chat Baidu ernie', done => {
        uni.chat(input, { provider: ModelProvider.Baidu, model: BaiduChatModel.ERNIE })
            .then(console.log)
            .catch(console.error)
            .finally(done)
    })

    test('Test chat Baidu ernie 4', done => {
        uni.chat(input, { provider: ModelProvider.Baidu, model: BaiduChatModel.ERNIE4 })
            .then(console.log)
            .catch(console.error)
            .finally(done)
    })

    test('Test chat Baidu ernie turbo stream', done => {
        uni.chat(input, { stream: true, provider: ModelProvider.Baidu, model: BaiduChatModel.ERNIE_TURBO }).then(
            res => {
                expect(res).toBeInstanceOf(Readable)
                const stream = res as Readable
                let data = ''
                stream.on('data', chunk => (data += JSON.parse(chunk.toString()).content))
                stream.on('end', () => console.log(data))
                stream.on('error', e => console.error(e))
                stream.on('close', () => done())
            }
        )
    })
})
