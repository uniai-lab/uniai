/** @format */

require('dotenv').config()
const UniAI = require('../').default

const { OPENAI_API, OPENAI_KEY, FLY_APP_ID, FLY_API_KEY, FLY_API_SECRET, GOOGLE_AI_KEY } = process.env

async function main() {
    let ai = new UniAI({
        OpenAI: { key: OPENAI_KEY, proxy: OPENAI_API },
        Google: { key: GOOGLE_AI_KEY },
        IFlyTek: { apiKey: FLY_API_KEY, appId: FLY_APP_ID, apiSecret: FLY_API_SECRET }
    })
    // one time output
    console.log('--------------------Example of one time chat----------------------')
    // default provider is OpenAI, model is gpt-3.5-turbo
    let res = await ai.chat('你是谁？是谁开发的？')
    console.log(res)

    console.log('--------------------Multi-lines of stream chat---------------------')
    const messages = [
        { role: 'user', content: 'hello' },
        { role: 'assistant', content: 'hi' },
        { role: 'user', content: '请说中文' },
        { role: 'user', content: '请说中文' },
        { role: 'user', content: '你是什么模型？是谁开发的？' }
    ]
    // use Google gemini
    res = await ai.chat(messages, { stream: true, provider: 'google', model: 'gemini-pro' })
    res.on('data', buff => {
        const data = JSON.parse(buff.toString())
        process.stdout.write(data.content)
    })
}
main()
