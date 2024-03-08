/** @format */
import 'dotenv/config'
import '../env.d.ts'
import UniAI, { ChatMessage } from '../src'
import { ChatModelProvider, ChatRoleEnum, ModelProvider, OpenAIChatModel, OpenAIEmbedModel } from '../interface/Enum'
import { Readable } from 'stream'

const { OPENAI_KEY, OPENAI_API } = process.env

const input = 'Hi, who are you? Answer in 10 words!'

let uni: UniAI

beforeAll(() => (uni = new UniAI({ OpenAI: { key: OPENAI_KEY.split(','), proxy: OPENAI_API } })))

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

    test('Test chat openai gpt-3.5-turbo-16k', done => {
        uni.chat(input, { provider: ChatModelProvider.OpenAI, model: OpenAIChatModel.GPT3_16K })
            .then(console.log)
            .catch(console.error)
            .finally(done)
    })

    test('Test chat openai gpt-4 stream', done => {
        uni.chat(input, { stream: true, provider: ChatModelProvider.OpenAI, model: OpenAIChatModel.GPT4 }).then(res => {
            expect(res).toBeInstanceOf(Readable)
            const stream = res as Readable
            let data = ''
            stream.on('data', chunk => (data += JSON.parse(chunk.toString()).content))
            stream.on('end', () => console.log(data))
            stream.on('error', e => console.error(e))
            stream.on('close', () => done())
        })
    })

    test('Test chat openai gpt-4 vision preview', done => {
        const input: ChatMessage[] = [
            {
                role: ChatRoleEnum.USER,
                content: '描述下这张图片，是个男人还是女人，她在做什么？',
                img: {
                    url: 'https://pics7.baidu.com/feed/1f178a82b9014a903fcc22f1e98d931fb11bee90.jpeg@f_auto?token=d5a33ea74668787d60d6f61c7b8f9ca2'
                }
            }
        ]
        uni.chat(input, { stream: true, provider: ChatModelProvider.OpenAI, model: OpenAIChatModel.GPT4_VISION }).then(
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
    }, 60000)

    test('Test OpenAI/text-embedding-ada2 embedding', done => {
        uni.embedding(input, { provider: ModelProvider.OpenAI, model: OpenAIEmbedModel.ADA })
            .then(res => {
                expect(res.dimension).toBe(1536)
                expect(res.embedding.length).toBe(1)
            })
            .catch(console.error)
            .finally(done)
    })
})
