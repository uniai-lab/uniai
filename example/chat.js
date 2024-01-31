/** @format */

require('dotenv').config()
const UniAI = require('../').default

const { OPENAI_API, OPENAI_KEY } = process.env

async function main() {
    const ai = new UniAI({ OpenAI: { OPENAI_API, OPENAI_KEY } })
    // one time output
    console.log('--------------------Example of one time chat----------------------')
    let res = await ai.chat('写一首100字的诗')
    console.log(res)

    console.log()
    // stream output
    console.log('----------------------Example of stream chat----------------------')
    res = await ai.chat('Write a poem of 50 words', { stream: true, provider: 'openai', model: 'gpt-4' })
    res.on('data', buff => {
        const data = JSON.parse(buff.toString())
        process.stdout.write(data.content)
    })
    res.on('end', console.log)
}
main()
