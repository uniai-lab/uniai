/** @format */
import 'dotenv/config'
import '../env.d.ts'
import UniAI from '../src'
import { EmbedModelProvider, ModelProvider, OtherEmbedModel } from '../interface/Enum'

const { OTHER_API } = process.env

const input = 'Hi, who are you? Answer in 10 words!'

let uni: UniAI

beforeAll(() => (uni = new UniAI({ Other: { api: OTHER_API } })))

describe('Other Tests', () => {
    test('Test list Other models', () => {
        const provider = uni.models.filter(v => v.value === EmbedModelProvider.Other)[0]
        console.log(provider)
        expect(provider.provider).toEqual('Other')
        expect(provider.value).toEqual(ModelProvider.Other)
    })

    test('Test Other text2vec-large-chinese embedding', done => {
        uni.embedding([input, input], { provider: ModelProvider.Other, model: OtherEmbedModel.LARGE_CHN })
            .then(res => {
                expect(res.dimension).toBe(1024)
                expect(res.embedding.length).toBe(2)
            })
            .catch(console.error)
            .finally(done)
    })
})
