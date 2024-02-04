/** @format */
import 'dotenv/config'
import '../env.d.ts'
import UniAI, { ImagineModelProvider, ModelProvider, OpenAIImagineModel } from '../src'

const { MID_JOURNEY_API, MID_JOURNEY_TOKEN, OPENAI_API, OPENAI_KEY } = process.env

const prompt = 'I have a dream'

let uni: UniAI

beforeAll(
    () =>
        (uni = new UniAI({
            MidJourney: { token: MID_JOURNEY_TOKEN, proxy: MID_JOURNEY_API },
            OpenAI: { proxy: OPENAI_API, key: OPENAI_KEY }
        }))
)

describe('Imagine Tests', () => {
    test('Test OpenAI imagine', done => {
        uni.imagine(prompt, { provider: ImagineModelProvider.OpenAI, model: OpenAIImagineModel.DALL_E_2 })
            .then(res => uni.task(ModelProvider.OpenAI, res.taskId))
            .then(console.log)
            .catch(console.error)
            .finally(done)
    })

    test('Test MJ imagine', done => {
        uni.imagine(prompt, { provider: ImagineModelProvider.MidJourney })
            .then(res => uni.task(ModelProvider.MidJourney, res.taskId))
            .then(console.log)
            .catch(console.error)
            .finally(done)
    })
})
