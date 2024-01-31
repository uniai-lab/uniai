/** @format */

require('dotenv').config()
const UniAI = require('../').default

const { OPENAI_API, OPENAI_KEY, GOOGLE_AI_KEY } = process.env

async function main() {
    let ai = new UniAI({
        OpenAI: { key: OPENAI_KEY, proxy: OPENAI_API },
        Google: { key: GOOGLE_AI_KEY.split(',') }
    })
    // one time output
    console.log('--------------------Example of one time chat----------------------')
    // default provider is OpenAI, model is gpt-3.5-turbo
    let res = await ai.chat('你是谁？是谁开发的？')

    console.log(res)
    res = await ai.chat('Who are you? Who developed you？', { provider: 'google' })
    console.log(res)
    res = await ai.chat('你是谁？是谁开发的？', { provider: 'google' })
    console.log(res)
    res = await ai.chat('Qui êtes - vous? Qui vous a développé?', { provider: 'google' })
    console.log(res)
    res = await ai.chat('あなたは誰ですか。誰が開発したの?', { provider: 'google' })
    console.log(res)
    res = await ai.chat('누구세요?누가 당신을 개발했습니까?', { provider: 'google' })
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
