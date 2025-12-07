/** @format */
import 'dotenv/config'
import '../env.d.ts'
import UniAI, { type ChatMessage, Prompt, type ReasoningLevel } from '../src'
import {
    ChatModelProvider,
    ChatRoleEnum,
    EmbedModelProvider,
    ModelProvider,
    OpenAIChatModel,
    OpenAIEmbedModel
} from '../interface/Enum'
import { Readable } from 'stream'
import { readFileSync } from 'fs'
import path from 'path'
import type { ChatCompletionTool } from 'openai/resources'

const { OPENAI_KEY, OPENAI_API } = process.env

const input: string = 'Introduce yourself briefly'
const input2: ChatMessage[] = [
    {
        role: ChatRoleEnum.USER,
        content: ['图片1描述了什么', '图片2描述了什么'],
        img: [
            'https://img2.baidu.com/it/u=2595743336,2138195985&fm=253&fmt=auto?w=801&h=800',
            'https://img0.baidu.com/it/u=3185399917,3849606089&fm=253&fmt=auto&app=138&f=JPEG?w=809&h=800'
        ]
    }
]

const input3: ChatMessage[] = [
    { role: ChatRoleEnum.SYSTEM, content: '你是一个翻译官！翻译中文为英文！' },
    { role: ChatRoleEnum.USER, content: '你好，你是谁？' },
    { role: ChatRoleEnum.ASSISTANT, content: 'Hello, who are you?' },
    { role: ChatRoleEnum.USER, content: ['你是一个聪明的模型', '其实你不是聪明的模型', '这两句话矛盾吗？'] }
]

const prompt: Prompt = new Prompt('机器人', '你是一个机器人，以下是关于你的基本信息', [
    new Prompt('基本信息', '- 姓名：小智\n- 年龄：18\n- 性别：男'),
    new Prompt('技能', '- 语言：中文、英文\n- 职业：程序员\n- 爱好：打游戏、看电影'),
    new Prompt('外观', '对你的外观进行描述', [
        new Prompt('外观描述', '- 身高：180cm\n- 体重：70kg\n- 头发颜色：黑色\n- 眼睛颜色：棕色'),
        new Prompt('服装', '- 上衣：黑色T恤\n- 裤子：蓝色牛仔裤\n- 鞋子：白色运动鞋')
    ])
])
const input4: ChatMessage[] = [
    { role: ChatRoleEnum.SYSTEM, content: prompt.toString() },
    { role: ChatRoleEnum.USER, content: '你是谁？简短介绍下你自己得特点' }
]

const audio = readFileSync(path.join(__dirname, 'test.wav')).toString('base64')
// for audio base64 input test
const input5: ChatMessage[] = [
    {
        role: ChatRoleEnum.USER,
        content: ['我一共给你发了几段语音？', '分别说了什么？', '有区别吗？'],
        audio: [audio, audio]
    }
]

interface OpenAIChatTestCase {
    title: string
    model: OpenAIChatModel
    prompt: string | ChatMessage[]
    stream?: boolean
    reasoning?: ReasoningLevel
    tools?: ChatCompletionTool[]
}

const weatherTool: ChatCompletionTool = {
    type: 'function',
    function: {
        name: 'get_weather',
        description: 'Get current temperature for a given location in English.',
        parameters: {
            type: 'object',
            properties: {
                location: {
                    type: 'string',
                    description: 'City and country, e.g. Macau, China'
                }
            },
            required: ['location'],
            additionalProperties: false
        },
        strict: true
    }
}

const openAIChatCases: OpenAIChatTestCase[] = [
    { title: 'gpt-3.5 single turn text', model: OpenAIChatModel.GPT3, prompt: input },
    { title: 'gpt-4 multi-turn stream', model: OpenAIChatModel.GPT4, prompt: input3, stream: true },
    { title: 'gpt-4 turbo vision stream', model: OpenAIChatModel.GPT4_TURBO, prompt: input2, stream: true },
    {
        title: 'gpt-4o-mini with tools',
        model: OpenAIChatModel.GPT_4O_MINI,
        prompt: '今天澳门天气如何？请用一句话回答',
        tools: [weatherTool]
    },
    {
        title: 'chatgpt-4o multimodal',
        model: OpenAIChatModel.CHAT_GPT_4O,
        prompt: input2
    },
    { title: 'gpt-4o default vision', model: OpenAIChatModel.GPT_4O, prompt: input2 },
    {
        title: 'gpt-4o audio preview',
        model: OpenAIChatModel.GPT_4O_AUDIO,
        prompt: input5
    },
    { title: 'gpt-4.1 persona recall', model: OpenAIChatModel.GPT_4_1, prompt: input4 },
    { title: 'gpt-4.1-mini quick summary', model: OpenAIChatModel.GPT_4_1_MINI, prompt: '用一句话介绍北京。' },
    { title: 'gpt-4.1-nano study tips', model: OpenAIChatModel.GPT_4_1_NANO, prompt: '列出两个提高专注力的小技巧。' },
    { title: 'gpt-5 flagship trends', model: OpenAIChatModel.GPT_5, prompt: '概述一下人工智能未来的三个趋势。' },
    {
        title: 'gpt-5 chat multi-turn',
        model: OpenAIChatModel.GPT_5_CHAT,
        prompt: input3
    },
    { title: 'gpt-5 mini productivity', model: OpenAIChatModel.GPT_5_MINI, prompt: '提供三个番茄钟使用技巧。' },
    {
        title: 'gpt-5 nano emoji stream',
        model: OpenAIChatModel.GPT_5_NANO,
        prompt: '给我做几个emoji表情，表现出你的愤怒。',
        stream: true
    },
    {
        title: 'gpt-5.1 thoughtful stream',
        model: OpenAIChatModel.GPT_5_1,
        prompt: '为什么天空是蓝色的？请一步步解释。',
        reasoning: 'none',
        stream: true
    },
    {
        title: 'gpt-5.1 chat latest multi-turn',
        model: OpenAIChatModel.GPT_5_1_CHAT,
        prompt: input3
    },
    {
        title: 'o1 math reasoning stream',
        model: OpenAIChatModel.O1,
        prompt: '请详细推理：若2x+3=11，x等于多少？',
        stream: true
    },
    {
        title: 'o3 itinerary reasoning stream',
        model: OpenAIChatModel.O3,
        prompt: '为上海周末亲子旅行制定行程，并解释选择。',
        stream: true
    },
    {
        title: 'o3-mini quick science note',
        model: OpenAIChatModel.O3_MINI,
        prompt: '用50个字解释云计算如何工作。'
    },
    {
        title: 'o4-mini study plan',
        model: OpenAIChatModel.O4_MINI,
        prompt: '设计一个为期五天的前端框架学习计划。'
    }
]

let uni: UniAI

beforeAll(() => (uni = new UniAI({ OpenAI: { key: OPENAI_KEY.split(','), proxy: OPENAI_API } })))

describe('OpenAI tests', () => {
    test('lists OpenAI models', () => {
        const provider = uni.models.filter(v => v.value === ModelProvider.OpenAI)[0]
        console.log(provider)
        expect(provider.models.length).toEqual(Object.values(OpenAIChatModel).length)
        expect(provider.provider).toEqual('OpenAI')
        expect(provider.value).toEqual(ModelProvider.OpenAI)
    })
    const createOpenAITest = ({ title, model, prompt, stream, reasoning, tools }: OpenAIChatTestCase) => {
        test(
            title,
            done => {
                const options: Record<string, unknown> = {
                    provider: ChatModelProvider.OpenAI,
                    model
                }

                if (reasoning) options.reasoning = reasoning
                if (stream) options.stream = true
                if (tools?.length) options.tools = tools

                if (stream) {
                    uni.chat(prompt, options)
                        .then(res => {
                            expect(res).toBeInstanceOf(Readable)
                            const readable = res as Readable
                            let data = ''
                            let finished = false
                            const finish = (err?: Error) => {
                                if (finished) return
                                finished = true
                                if (err) done(err)
                                else done()
                            }
                            readable.on('data', chunk => {
                                try {
                                    const parsed = JSON.parse(chunk.toString())
                                    data += parsed.content ?? ''
                                } catch (error) {
                                    console.error('Failed to parse chunk', error)
                                }
                            })
                            readable.on('end', () => console.log(model, data))
                            readable.on('error', e => {
                                console.error(e)
                                finish(e as Error)
                            })
                            readable.on('close', () => finish())
                        })
                        .catch(err => {
                            console.error(err)
                            done(err)
                        })
                    return
                }

                uni.chat(prompt, options)
                    .then(res => {
                        console.log(model, res)
                        done()
                    })
                    .catch(err => {
                        console.error(err)
                        done(err)
                    })
            },
            60000
        )
    }

    openAIChatCases.forEach(createOpenAITest)

    test('OpenAI/text-embedding-ada2 embedding', done => {
        uni.embedding(input, { provider: EmbedModelProvider.OpenAI, model: OpenAIEmbedModel.ADA })
            .then(res => expect(res.embedding.length).toBe(1))
            .catch(console.error)
            .finally(done)
    })

    test('OpenAI/text-embedding-3-large embedding', done => {
        uni.embedding(input, { provider: EmbedModelProvider.OpenAI, model: OpenAIEmbedModel.LARGE })
            .then(res => expect(res.embedding.length).toBe(1))
            .catch(console.error)
            .finally(done)
    })

    test('OpenAI/text-embedding-3-small embedding', done => {
        uni.embedding(input, { provider: EmbedModelProvider.OpenAI, model: OpenAIEmbedModel.SMALL })
            .then(res => expect(res.embedding.length).toBe(1))
            .catch(console.error)
            .finally(done)
    })
})
