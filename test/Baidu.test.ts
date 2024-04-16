/** @format */
import 'dotenv/config'
import '../env.d.ts'
import UniAI from '../src'
import { ModelProvider, BaiduChatModel, ChatModelProvider } from '../interface/Enum'
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

    test('Test chat Baidu ernie3', done => {
        uni.chat(input, { provider: ChatModelProvider.Baidu, model: BaiduChatModel.ERNIE_3_5 })
            .then(console.log)
            .finally(done)
    })

    test('Test chat Baidu ernie4', done => {
        uni.chat(input, { provider: ChatModelProvider.Baidu, model: BaiduChatModel.ERNIE_4 })
            .then(console.log)
            .finally(done)
    })

    test('Test chat Baidu ernie lite stream', done => {
        uni.chat(input, { stream: true, provider: ChatModelProvider.Baidu, model: BaiduChatModel.ERNIE_LITE }).then(
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

    test('Test chat Baidu ernie speed', done => {
        uni.chat(input, { provider: ChatModelProvider.Baidu, model: BaiduChatModel.ERNIE_SPEED })
            .then(console.log)
            .finally(done)
    })

    test('Test chat Baidu ernie tiny', done => {
        uni.chat(input, { provider: ChatModelProvider.Baidu, model: BaiduChatModel.ERNIE_TINY })
            .then(console.log)
            .finally(done)
    })

    test('Test chat Baidu ernie character', done => {
        uni.chat(input, { provider: ChatModelProvider.Baidu, model: BaiduChatModel.ERNIE_CHAR })
            .then(console.log)
            .finally(done)
    })

    test('Test chat Baidu ernie speed stream', done => {
        uni.chat(input, { stream: true, provider: ChatModelProvider.Baidu, model: BaiduChatModel.ERNIE_SPEED_128K })
            .then(res => {
                expect(res).toBeInstanceOf(Readable)
                const stream = res as Readable
                let data = ''
                stream.on('data', chunk => console.log(JSON.parse(chunk.toString())))
                stream.on('end', () => console.log(data))
                stream.on('error', e => console.error(e))
                stream.on('close', () => done())
            })
            .finally(done)
    }, 6000)
})
