/** @format */
import 'dotenv/config'
import '../env.d.ts'
import UniAI, { ImagineModel, ImagineModelProvider, ModelProvider } from '../src'

const {
    MID_JOURNEY_API,
    MID_JOURNEY_TOKEN,
    OPENAI_API,
    OPENAI_KEY,
    STABILITY_API,
    STABILITY_KEY,
    FLY_API_KEY,
    FLY_API_SECRET,
    FLY_APP_ID
} = process.env

const prompt = 'a cute panda is eating bamboo'

let uni: UniAI

beforeAll(() => {
    uni = new UniAI({
        MidJourney: { token: MID_JOURNEY_TOKEN, proxy: MID_JOURNEY_API },
        OpenAI: { proxy: OPENAI_API, key: OPENAI_KEY },
        StabilityAI: { key: STABILITY_KEY, proxy: STABILITY_API },
        IFlyTek: { apiKey: FLY_API_KEY, appId: FLY_APP_ID, apiSecret: FLY_API_SECRET }
    })
})

describe('Imagine Tests', () => {
    test('Test OpenAI imagine', done => {
        uni.imagine(prompt, { provider: ImagineModelProvider.OpenAI, model: ImagineModel.DALL_E_3 })
            .then(res => uni.task(ModelProvider.OpenAI, res.taskId))
            .then(console.log)
            .catch(console.error)
            .finally(done)
    }, 60000)

    test('Test MJ imagine', done => {
        uni.imagine(prompt, { provider: ImagineModelProvider.MidJourney })
            .then(res => uni.task(ModelProvider.MidJourney, res.taskId))
            .then(console.log)
            .catch(console.error)
            .finally(done)
    })

    test('Test Stability AI imagine', done => {
        uni.imagine(prompt, { provider: ImagineModelProvider.StabilityAI })
            .then(res => uni.task(ModelProvider.StabilityAI, res.taskId))
            .then(console.log)
            .catch(console.error)
            .finally(done)
    }, 60000)

    test('Test MJ tasks', done => {
        uni.task(ModelProvider.MidJourney, '1707125639729316').then(console.log).catch(console.error).finally(done)
    }, 60000)

    test('Test DALL-E tasks', done => {
        uni.task(ModelProvider.OpenAI)
            .then(res => console.log(res.pop()))
            .catch(console.error)
            .finally(done)
    })

    test('Test StabilityAI tasks', done => {
        uni.task(ModelProvider.StabilityAI)
            .then(res => console.log(res.pop()))
            .catch(console.error)
            .finally(done)
    })

    test('Test IFlyTek imagine', done => {
        uni.imagine(prompt, { provider: ImagineModelProvider.IFlyTek })
            .then(res => uni.task(ModelProvider.IFlyTek, res.taskId))
            .then(console.log)
            .catch(console.error)
            .finally(done)
    }, 60000)
})
