/** @format */

require('dotenv').config()
const UniAI = require('../').default

const {
    OPENAI_API,
    OPENAI_KEY,
    GOOGLE_AI_KEY,
    GOOGLE_AI_API,
    MOONSHOT_KEY,
    ZHIPU_AI_KEY,
    FLY_APP_ID,
    FLY_API_KEY,
    FLY_API_SECRET,
    BAIDU_API_KEY,
    BAIDU_SECRET_KEY,
    GLM_API
} = process.env

const ai = new UniAI({
    OpenAI: { key: OPENAI_KEY, proxy: OPENAI_API },
    Google: { key: GOOGLE_AI_KEY.split(','), proxy: GOOGLE_AI_API },
    MoonShot: { key: MOONSHOT_KEY },
    Baidu: { apiKey: BAIDU_API_KEY, secretKey: BAIDU_SECRET_KEY },
    IFlyTek: { appId: FLY_APP_ID, apiKey: FLY_API_KEY, apiSecret: FLY_API_SECRET },
    GLM: { key: ZHIPU_AI_KEY, local: GLM_API }
})

async function main() {
    console.log(`One-time chat: [OpenAI/GPT] default`)
    await ai.chat('你是谁？是谁开发的？').then(res => console.log('🤖', res))
    console.log('\n')
    await stream('Introduce yourself in 50 words', { provider: 'google', model: 'gemini-pro' })
    await stream('你是谁？是谁开发的？', { provider: 'iflytek', model: 'v3.1' })
    await stream('あなたは誰ですか。誰が開発したの?', { provider: 'glm', model: 'glm-4' })
    await stream('누구세요?누가 당신을 개발했습니까?', { provider: 'moonshot', model: 'moonshot-v1-8k' })
}

async function stream(query, option) {
    return new Promise((resolve, reject) => {
        option.stream = true
        ai.chat(query, option).then(res => {
            console.log(`🤖 [${option.provider} ${option.model}]: ${query}`)
            res.on('data', buff => process.stdout.write(JSON.parse(buff.toString()).content))
            res.on('end', resolve)
            res.on('error', reject)
            res.on('close', () => console.log('\n'))
        })
    })
}

main()
