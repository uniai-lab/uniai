/** @format */

require('dotenv').config()
const { ChatModel, ChatModelProvider } = require('../dist')
const UniAI = require('../').default

const {
    OPENAI_API,
    OPENAI_KEY,
    GOOGLE_AI_KEY,
    GOOGLE_AI_API,
    MOONSHOT_KEY,
    ZHIPU_AI_KEY,
    FLY_API_PASS,
    BAIDU_API_KEY,
    BAIDU_SECRET_KEY,
    ALI_KEY,
    DS_KEY,
    X_AI_KEY,
    ANTHROPIC_KEY,
    ANTHROPIC_API
} = process.env

const ai = new UniAI({
    OpenAI: { key: OPENAI_KEY, proxy: OPENAI_API },
    Google: { key: GOOGLE_AI_KEY, proxy: GOOGLE_AI_API },
    Anthropic: { key: ANTHROPIC_KEY, proxy: ANTHROPIC_API },
    MoonShot: { key: MOONSHOT_KEY },
    Baidu: { apiKey: BAIDU_API_KEY, secretKey: BAIDU_SECRET_KEY },
    IFlyTek: { apiPassword: FLY_API_PASS },
    GLM: { key: ZHIPU_AI_KEY },
    DeepSeek: { key: DS_KEY },
    XAI: { key: X_AI_KEY },
    AliYun: { key: ALI_KEY }
})

async function main() {
    // chat not stream
    await ai.chat('你是谁？是谁开发的？', { temperature: 0, top: 1 }).then(res => console.log('🤖', res))
    // image chat
    const input = [
        {
            role: 'user',
            content: 'Describe this guy',
            img: 'https://api.uniai.cas-ll.cn/wechat/file?path=minio/6c9b6317-97a8-43ec-b949-cf3f861f8575.png&name=IMG_20190208_132658%20(2).png'
        }
    ]
    await stream(input, { provider: ChatModelProvider.OpenAI, model: ChatModel.GPT_4_1_NANO })
    await stream(input, { provider: ChatModelProvider.Google, model: ChatModel.GEM_FLASH_2 })

    await stream('你个垃圾', { provider: ChatModelProvider.Baidu, model: ChatModel.ERNIE_LITE_8K, temperature: 0 })
    await stream('你是谁？帮我写一首100字的唐诗', { provider: ChatModelProvider.IFlyTek, model: ChatModel.SPARK_LITE })
    await stream('あなたは誰ですか。誰が開発したの?', { provider: ChatModelProvider.GLM, model: ChatModel.GLM_4_FLASH })
    await stream('누구세요?누가 당신을 개발했습니까?', { provider: ChatModelProvider.MoonShot })
    await stream('浓是上海人伐?', { provider: ChatModelProvider.AliYun, model: ChatModel.QWEN_TURBO })
    await stream('Bonjour', { provider: ChatModelProvider.DeepSeek, model: ChatModel.DEEPSEEK_V3 })
    await stream('浓是上海人伐?', { provider: ChatModelProvider.XAI, model: ChatModel.GROK2 })
    await stream('你是什么模型?', { provider: ChatModelProvider.Anthropic, model: ChatModel.CLAUDE_4_SONNET })
}

async function stream(query, option) {
    return new Promise((resolve, reject) => {
        option.stream = true
        ai.chat(query, option)
            .then(res => {
                console.log(`🤖 [${option.provider}/${option.model}]: ${query[0].content || query}`)
                res.on('data', buff => process.stdout.write(JSON.parse(buff.toString()).content))
                res.on('end', resolve)
                res.on('error', reject)
                res.on('close', () => console.log('\n'))
            })
            .catch(e => console.log(e.message))
    })
}

main()
