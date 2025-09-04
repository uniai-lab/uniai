/** @format */
import 'dotenv/config'
import { Readable } from 'stream'
import '../env.d.ts'
import UniAI, { ChatMessage, ChatResponse } from '../src'
import { AnthropicChatModel, ChatModelProvider, ChatRoleEnum, ModelProvider } from '../interface/Enum'

const { ANTHROPIC_API, ANTHROPIC_KEY } = process.env

const input: string = 'Hi, who are you? Answer in 10 words!'
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
    { role: ChatRoleEnum.USER, content: '你是一个聪明的模型' }
]

const input4: ChatMessage[] = [
    { role: ChatRoleEnum.SYSTEM, content: '你是一个机器人助手，回答问题要简洁明了。' },
    { role: ChatRoleEnum.USER, content: '你是谁？简短介绍下你自己的特点' }
]

let uni: UniAI

beforeAll(() => (uni = new UniAI({ Anthropic: { key: ANTHROPIC_KEY?.split(','), proxy: ANTHROPIC_API } })))

describe('Anthropic Chat Test', () => {
    test('Test list Anthropic models', () => {
        const provider = uni.models.filter(v => v.value === ModelProvider.Anthropic)[0]
        console.log(provider)
        expect(provider.models.length).toEqual(Object.values(AnthropicChatModel).length)
        expect(provider.provider).toEqual('Anthropic')
        expect(provider.value).toEqual(ModelProvider.Anthropic)
    })

    test('Test chat Anthropic Claude 3.5 Haiku', done => {
        uni.chat(input4, {
            stream: false,
            provider: ChatModelProvider.Anthropic,
            model: AnthropicChatModel.CLAUDE_3_5_HAIKU
        })
            .then(console.log)
            .catch(console.error)
            .finally(done)
    }, 60000)

    test('Test chat Anthropic Claude 3.7 Sonnet', done => {
        uni.chat(input3, {
            stream: false,
            provider: ChatModelProvider.Anthropic,
            model: AnthropicChatModel.CLAUDE_3_7_SONNET
        })
            .then(console.log)
            .catch(console.error)
            .finally(done)
    }, 60000)

    test('Test chat Anthropic Claude 4 Opus', done => {
        uni.chat(input, {
            stream: false,
            provider: ChatModelProvider.Anthropic,
            model: AnthropicChatModel.CLAUDE_4_OPUS
        })
            .then(console.log)
            .catch(console.error)
            .finally(done)
    }, 60000)

    test('Test chat Anthropic Claude 4 Sonnet', done => {
        uni.chat(input4, {
            stream: false,
            provider: ChatModelProvider.Anthropic,
            model: AnthropicChatModel.CLAUDE_4_SONNET
        })
            .then(console.log)
            .catch(console.error)
            .finally(done)
    }, 60000)

    test('Test chat Anthropic Claude 4.1 Opus', done => {
        uni.chat(input, {
            stream: false,
            provider: ChatModelProvider.Anthropic,
            model: AnthropicChatModel.CLAUDE_4_1_OPUS
        })
            .then(console.log)
            .catch(console.error)
            .finally(done)
    }, 60000)

    test('Test chat Anthropic Claude 3 Haiku', done => {
        uni.chat(input4, {
            stream: false,
            provider: ChatModelProvider.Anthropic,
            model: AnthropicChatModel.CLAUDE_3_HAIKU
        })
            .then(console.log)
            .catch(console.error)
            .finally(done)
    }, 60000)

    test('Test chat Anthropic Claude 3.7 Sonnet stream', done => {
        uni.chat(input, {
            stream: true,
            provider: ChatModelProvider.Anthropic,
            model: AnthropicChatModel.CLAUDE_3_7_SONNET
        }).then(res => {
            expect(res).toBeInstanceOf(Readable)
            const stream = res as Readable
            let data = ''
            stream.on('data', chunk => (data += JSON.parse(chunk.toString()).content))
            stream.on('end', () => console.log(data))
            stream.on('error', e => console.error(e))
            stream.on('close', () => done())
        })
    }, 60000)

    test('Test chat Anthropic Claude 4 Sonnet stream', done => {
        uni.chat(input4, {
            stream: true,
            provider: ChatModelProvider.Anthropic,
            model: AnthropicChatModel.CLAUDE_4_SONNET
        }).then(res => {
            expect(res).toBeInstanceOf(Readable)
            const stream = res as Readable
            let data = ''
            stream.on('data', chunk => (data += JSON.parse(chunk.toString()).content))
            stream.on('end', () => console.log(data))
            stream.on('error', e => console.error(e))
            stream.on('close', () => done())
        })
    }, 60000)

    test('Test chat Anthropic Claude 3.7 Sonnet with vision stream', done => {
        uni.chat(input2, {
            stream: true,
            provider: ChatModelProvider.Anthropic,
            model: AnthropicChatModel.CLAUDE_3_7_SONNET
        }).then(res => {
            expect(res).toBeInstanceOf(Readable)
            const stream = res as Readable
            let data = ''
            stream.on('data', chunk => (data += JSON.parse(chunk.toString()).content))
            stream.on('end', () => console.log(data))
            stream.on('error', e => console.error(e))
            stream.on('close', () => done())
        })
    }, 60000)

    test('Test chat Anthropic Claude 4 Opus with vision', done => {
        uni.chat(input2, {
            stream: false,
            provider: ChatModelProvider.Anthropic,
            model: AnthropicChatModel.CLAUDE_4_OPUS
        })
            .then(console.log)
            .catch(console.error)
            .finally(done)
    }, 60000)

    test('Test chat Anthropic Claude opus 4.1 Sonnet with tools', done => {
        const tools = [
            {
                type: 'function',
                function: {
                    name: 'get_weather',
                    description: 'Get current temperature for a given location.',
                    parameters: {
                        type: 'object',
                        properties: {
                            location: {
                                type: 'string',
                                description: 'City and country e.g. Beijing, China, should in English'
                            }
                        },
                        required: ['location'],
                        additionalProperties: false
                    }
                }
            }
        ]
        uni.chat('今天北京天气如何？', {
            stream: false,
            provider: ChatModelProvider.Anthropic,
            model: AnthropicChatModel.CLAUDE_4_1_OPUS,
            tools
        })
            .then(r => {
                console.log(r)
                if ((r as ChatResponse).tools) {
                    console.log('Tool calls:', (r as ChatResponse).tools)
                }
            })
            .catch(console.error)
            .finally(done)
    }, 60000)

    test('Test chat Anthropic Claude 4 Sonnet with tools', done => {
        const tools = [
            {
                type: 'function',
                function: {
                    name: 'calculate',
                    description: 'Perform basic arithmetic calculations',
                    parameters: {
                        type: 'object',
                        properties: {
                            operation: {
                                type: 'string',
                                enum: ['add', 'subtract', 'multiply', 'divide'],
                                description: 'The arithmetic operation to perform'
                            },
                            a: {
                                type: 'number',
                                description: 'First number'
                            },
                            b: {
                                type: 'number',
                                description: 'Second number'
                            }
                        },
                        required: ['operation', 'a', 'b']
                    }
                }
            }
        ]
        uni.chat('What is 15 multiplied by 7?', {
            stream: false,
            provider: ChatModelProvider.Anthropic,
            model: AnthropicChatModel.CLAUDE_4_SONNET,
            tools,
            toolChoice: 'auto'
        })
            .then(r => {
                console.log(r)
                if ((r as ChatResponse).tools) {
                    console.log('Tool calls:', (r as ChatResponse).tools)
                }
            })
            .catch(console.error)
            .finally(done)
    }, 60000)
})
