/** @format */

// Example of use UniAI to generate content embeddings

require('dotenv').config()
const UniAI = require('../').default

const { OPENAI_API, OPENAI_KEY } = process.env

async function embed() {
    const ai = new UniAI({ OpenAI: { proxy: OPENAI_API, key: OPENAI_KEY } })
    const res = await ai.embedding('hello world')
    console.log(res.embedding)
}

embed()
