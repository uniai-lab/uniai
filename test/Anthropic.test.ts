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
            'data:image/jpeg;base64,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',
            'data:image/png;base64,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'
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

    test.only('Test chat Anthropic Claude 4.5 Sonnet with vision', done => {
        uni.chat(input2, {
            stream: false,
            provider: ChatModelProvider.Anthropic,
            model: AnthropicChatModel.CLAUDE_4_5_SONNET
        })
            .then(console.log)
            .catch(console.error)
            .finally(done)
    }, 60000)
})
