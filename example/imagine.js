/** @format */

// Example of use UniAI to imagine

require('dotenv').config()
const UniAI = require('../').default

const { MID_JOURNEY_API, MID_JOURNEY_TOKEN, OPENAI_API, OPENAI_KEY } = process.env
const prompt = 'I have a dream'

async function main() {
    const ai = new UniAI({
        MidJourney: { token: MID_JOURNEY_TOKEN, proxy: MID_JOURNEY_API },
        OpenAI: { proxy: OPENAI_API, key: OPENAI_KEY }
    })

    let res = await ai.imagine(prompt)
    console.log(res)
    res = await ai.task('openai', res.taskId)
    console.log(res)

    res = await ai.imagine(prompt, { provider: 'midjourney' })
    console.log(res)
    res = await ai.task('midjourney', res.taskId)
    console.log(res)
}

main()
