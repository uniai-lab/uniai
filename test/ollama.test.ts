/**
 * @format
 *
 * Test Ollama deployed models
 *
 */

/** @format */
import 'dotenv/config'
import '../env.d.ts'
import UniAI, { ChatResponse } from '../src'
import { ChatModelProvider, ModelProvider } from '../interface/Enum'
import { Readable } from 'stream'

const { OTHER_API } = process.env

const input = 'Hi, who are you? Answer in 10 words!'

describe('Other Tests', () => {
    test('Test chat model qwen2.5:0.5b', done => {
        const uni = new UniAI({ Other: { api: OTHER_API } })
        uni.chat(input, { stream: false, provider: ChatModelProvider.Other, model: 'qwen2.5:0.5b' })
            .then(console.log)
            .catch(console.error)
            .finally(done)
    }, 60000)

    test('Test chat other openai qwen3:0.6b stream', done => {
        const uni = new UniAI({ Other: { api: OTHER_API } })
        uni.chat(input, { stream: true, provider: ChatModelProvider.Other, model: 'qwen3:0.6b' }).then(res => {
            expect(res).toBeInstanceOf(Readable)
            const stream = res as Readable
            let data = ''
            stream.on('data', chunk => (data += JSON.parse(chunk.toString()).content))
            stream.on('end', () => console.log(data))
            stream.on('error', e => console.error(e))
            stream.on('close', () => done())
        })
    }, 60000)

    // not support
    test('Test chat qwen3:0.6 model with tools', done => {
        const uni = new UniAI({ Other: { api: OTHER_API } })
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
                                description: 'City and country e.g. Bogotá, Colombia, should in English'
                            }
                        },
                        required: ['location'],
                        additionalProperties: false
                    },
                    strict: true
                }
            }
        ]
        uni.chat('今天澳门天气如何？', { stream: false, provider: ChatModelProvider.Other, model: 'qwen3:0.6b', tools })
            .then(r => console.log((r as ChatResponse).tools))
            .catch(console.error)
            .finally(done)
    }, 60000)

    test('Test Other qwen3-embedding:0.6b', done => {
        const uni = new UniAI({ Other: { api: OTHER_API } })
        uni.embedding([input, input + 'hello'], { provider: ModelProvider.Other, model: 'qwen3-embedding:0.6b' })
            .then(res => {
                console.log(res)
                return res
            })
            .then(res => expect(res.embedding.length).toBe(2))
            .catch(console.error)
            .finally(done)
    })

    test('Test Other bge-m3:567m embedding', done => {
        const uni = new UniAI({ Other: { api: OTHER_API } })
        uni.embedding([input, input + 'hello'], { provider: ModelProvider.Other, model: 'bge-m3:567m' })
            .then(res => {
                console.log(res)
                return res
            })
            .then(res => expect(res.embedding.length).toBe(2))
            .catch(console.error)
            .finally(done)
    })

    test('Test Other embeddinggemma:300m embedding', done => {
        const uni = new UniAI({ Other: { api: OTHER_API } })
        uni.embedding([input, input + 'hello'], { provider: ModelProvider.Other, model: 'embeddinggemma:300m' })
            .then(res => {
                console.log(res)
                return res
            })
            .then(res => expect(res.embedding.length).toBe(2))
            .catch(console.error)
            .finally(done)
    })

    test('Test Other qwen3-embedding:4b embedding', done => {
        const uni = new UniAI({ Other: { api: OTHER_API } })
        uni.embedding([input, input + 'hello'], { provider: ModelProvider.Other, model: 'qwen3-embedding:4b' })
            .then(res => {
                console.log(res)
                return res
            })
            .then(res => expect(res.embedding.length).toBe(2))
            .catch(console.error)
            .finally(done)
    })

    test('Test Other bge-large:335m embedding', done => {
        const uni = new UniAI({ Other: { api: OTHER_API } })
        uni.embedding([input, input + 'hello'], { provider: ModelProvider.Other, model: 'bge-large:335m' })
            .then(res => {
                console.log(res)
                return res
            })
            .then(res => expect(res.embedding.length).toBe(2))
            .catch(console.error)
            .finally(done)
    })

    test('Test Other nomic-embed-text:v1.5 embedding', done => {
        const uni = new UniAI({ Other: { api: OTHER_API } })
        uni.embedding([input, input + 'hello'], { provider: ModelProvider.Other, model: 'nomic-embed-text:v1.5' })
            .then(res => {
                console.log(res)
                return res
            })
            .then(res => expect(res.embedding.length).toBe(2))
            .catch(console.error)
            .finally(done)
    })
})
