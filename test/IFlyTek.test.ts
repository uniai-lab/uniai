/** @format */
import 'dotenv/config'
import '../env.d.ts'
import UniAI from '../src'
import { ModelProvider, IFlyTekChatModel } from '../interface/Enum'
import { Readable } from 'stream'

const { FLY_API_KEY, FLY_API_SECRET, FLY_APP_ID } = process.env

const input = 'Hi, who are you? Answer in 10 words!'

let uni: UniAI

beforeAll(() => (uni = new UniAI({ IFlyTek: { apiKey: FLY_API_KEY, appId: FLY_APP_ID, apiSecret: FLY_API_SECRET } })))

describe('IFlyTek Tests', () => {
    test('Test list IFlyTek models', () => {
        const provider = uni.models.filter(v => v.value === ModelProvider.IFlyTek)[0]
        console.log(provider)
        expect(provider.provider).toEqual('IFlyTek')
        expect(provider.models.length).toEqual(Object.values(IFlyTekChatModel).length)
        expect(provider.value).toEqual(ModelProvider.IFlyTek)
    })

    test('Test chat iFlyTek spark v3.1', done => {
        uni.chat(input, { provider: ModelProvider.IFlyTek, model: IFlyTekChatModel.SPARK_V3 })
            .then(console.log)
            .catch(console.error)
            .finally(done)
    })

    test('Test chat IFlyTek spark v1.1 stream', done => {
        uni.chat(input, { stream: true, provider: ModelProvider.IFlyTek, model: IFlyTekChatModel.SPARK_V1 }).then(
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
