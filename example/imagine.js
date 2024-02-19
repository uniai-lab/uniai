/** @format */

// Example of use UniAI to imagine

require('dotenv').config()
const UniAI = require('../').default

const { MID_JOURNEY_API, MID_JOURNEY_TOKEN, OPENAI_API, OPENAI_KEY, STABILITY_KEY } = process.env
const prompt =
    'Pink dress, Candy, Sandy, Mandy, short hair, blonde hair, bangs, forehead, red lipstick, elbow gloves, hair accessories, high heels, sitting, cross legged, high chair, cocktail, holding cocktail glass, looking through the glass.'
const negativePrompt = 'EasyNegative, badhandv4, badv5, aid210, aid291,'

async function main() {
    const ai = new UniAI({
        MidJourney: { token: MID_JOURNEY_TOKEN, proxy: MID_JOURNEY_API },
        OpenAI: { proxy: OPENAI_API, key: OPENAI_KEY },
        StabilityAI: { key: STABILITY_KEY }
    })

    console.log('Imagine by OpenAI DALL-E...')
    let res = await ai.imagine(prompt, { provider: 'openai', negativePrompt, model: 'dall-e-3' })
    console.log('DALL-E Imagine:', res)
    let task = await ai.task('openai', res.taskId)
    console.log('DALL-E Task:', task)

    console.log('Imagine by Stability AI...')
    res = await ai.imagine(prompt, { provider: 'stability.ai', negativePrompt })
    console.log('Stability Imagine:', res)
    task = await ai.task('stability.ai', res.taskId)
    console.log('Stability Task:', task)

    console.log('Imagine by Midjourney...')
    res = await ai.imagine(prompt, { provider: 'midjourney', negativePrompt })
    console.log('MJ Imagine:', res)
    task = await ai.task('midjourney', res.taskId)
    console.log('MJ Task:', task)
    // waiting for 1 min, image may be completed, then test change
    await sleep(60000)
    task = await ai.task('midjourney', res.taskId)
    console.log('MJ Task 1 mins later:', task)

    console.log('Modify UPSCALE by Midjourney...')
    const res2 = await ai.change('midjourney', res.taskId, 'UPSCALE', 4)
    await sleep(60000)
    const task2 = await ai.task('midjourney', res2.taskId)
    console.log('MJ UPSCALE Task 1 mins later:', task2)
}

function sleep(time) {
    return new Promise(resolve => setTimeout(resolve, time))
}

main()
