/** @format */

// Example of use UniAI to imagine

require('dotenv').config()
const UniAI = require('../').default

const {
    MID_JOURNEY_API,
    MID_JOURNEY_TOKEN,
    OPENAI_API,
    OPENAI_KEY,
    STABILITY_KEY,
    MID_JOURNEY_IMG_PROXY,
    FLY_API_KEY,
    FLY_API_SECRET,
    FLY_APP_ID
} = process.env
const prompt =
    'Pink dress, Candy, Sandy, Mandy, short hair, blonde hair, bangs, forehead, red lipstick, elbow gloves, hair accessories, high heels, sitting, cross legged, high chair, cocktail, holding cocktail glass, looking through the glass.'
const negativePrompt = 'EasyNegative, badhandv4, badv5, aid210, aid291,'

async function main() {
    // init uniai
    const ai = new UniAI({
        MidJourney: { token: MID_JOURNEY_TOKEN, proxy: MID_JOURNEY_API, imgProxy: MID_JOURNEY_IMG_PROXY },
        OpenAI: { proxy: OPENAI_API, key: OPENAI_KEY },
        StabilityAI: { key: STABILITY_KEY },
        IFlyTek: { apiKey: FLY_API_KEY, appId: FLY_APP_ID, apiSecret: FLY_API_SECRET }
    })

    // OpenAI dall-e
    console.log('Imagine by OpenAI DALL-E...')
    let res = await ai.imagine(prompt, { provider: 'openai', negativePrompt, model: 'dall-e-3' })
    console.log('DALL-E Imagine:', res)
    let task = await ai.task('openai', res.taskId)
    console.log('DALL-E Task:', task)

    // Stability AI
    console.log('Imagine by Stability AI...')
    res = await ai.imagine(prompt, { provider: 'stability.ai', negativePrompt })
    console.log('Stability Imagine:', res)
    task = await ai.task('stability.ai', res.taskId)
    console.log('Stability Task:', task)

    // IFlyTek
    console.log('Imagine by IFlyTek...')
    res = await ai.imagine(prompt, { provider: 'iflytek' })
    console.log('IFlyTek Imagine:', res)
    task = await ai.task('iflytek', res.taskId)
    console.log('IFlyTek Task:', task)

    // Midjourney proxy
    console.log('Imagine by Midjourney...')
    res = await ai.imagine(prompt, { provider: 'midjourney', negativePrompt })
    while (1) {
        const task = await ai.task('midjourney', res.taskId)
        await sleep(1000)
        console.log(task)
        if (task[0].progress === 100) break
    }

    console.log('Modify UPSCALE by Midjourney...')
    const res2 = await ai.change('midjourney', res.taskId, 'UPSCALE', 4)
    while (1) {
        const task2 = await ai.task('midjourney', res2.taskId)
        await sleep(1000)
        console.log(task2)
        if (task2[0].progress === 100) break
    }
}

function sleep(time) {
    return new Promise(resolve => setTimeout(resolve, time))
}

main()
