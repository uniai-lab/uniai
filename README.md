<!-- @format -->

<p align="center">
  <img src="./logo.png" alt="图片描述" width="图片宽度" height="图片高度">
</p>

<h1 align="center">Uni-AI<h1>

<h2 align="center" >
Unifying all AI models!
</h2>

## Supported Models

-   [IFLYTEK/Spark](https://xinghuo.xfyun.cn)
-   [THUDM/ChatGLM-6B](https://github.com/THUDM/ChatGLM3)
-   [ZHIPU/GLM3-4](https://github.com/THUDM/ChatGLM3)
-   [OpenAI/GPT](https://platform.openai.com)
-   [Baidu/WenXin workshop](https://cloud.baidu.com/product/wenxinworkshop)
-   [Google/Gemini](https://makersuite.google.com/app/)
-   [Stable Diffusion](https://github.com/AUTOMATIC1111/stable-diffusion-webui)
-   [OpenAI/DALL-E](https://platform.openai.com)
-   [Midjourney](https://github.com/novicezk/midjourney-proxy)
-   [GanymedeNil/text2vec-large-chinese](https://huggingface.co/GanymedeNil/text2vec-large-chinese)

## Install

**yarn**

```
yarn add uniai
```

**npm**

```
npm install uniai
```

## Example

**List available models in UniAI**

```typescript
import UniAI from 'uniai'

const uni = new UniAI()
console.log(uni.models)
```

**OUTPUT**

```json
[
    {
        "provider": "OpenAI",
        "value": "openai",
        "models": [
            "gpt-3.5-turbo-1106",
            "gpt-3.5-turbo",
            "gpt-3.5-turbo-16k",
            "gpt-4",
            "gpt-4-32k",
            "gpt-4-1106-preview",
            "gpt-4-vision-preview"
        ]
    },
    {
        "provider": "IFlyTek",
        "value": "iflytek",
        "models": ["v1.1", "v2.1", "v3.1"]
    },
    {
        "provider": "Baidu",
        "value": "baidu",
        "models": ["completions", "completions_pro", "ernie_bot_8k", "eb-instant"]
    },
    {
        "provider": "Google",
        "value": "google",
        "models": ["gemini-pro", "gemini-pro-vision", "gemini-ultra"]
    },
    {
        "provider": "GLM",
        "value": "glm",
        "models": ["chatglm3-6b-32k", "glm-3-turbo", "glm-4", "glm-4v"]
    },
    {
        "provider": "Other",
        "value": "other",
        "models": []
    }
]
```

**Hello world chat**

```typescript
const OPENAI_KEY = // [Your OpenAI Key (required)]
const OPENAI_API = // [Your OpenAI API proxy (optional)]
const uni = new UniAI({ OpenAI: { OPENAI_KEY, OPENAI_API } })
const res = await uni.chat()
console.log(res)
```

**OUTPUT**

```json
{
    "content": "I am OpenAI's language model trained to assist with information.",
    "model": "gpt-3.5-turbo-0613",
    "object": "chat.completion",
    "promptTokens": 20,
    "completionTokens": 13,
    "totalTokens": 33
}
```

**Stream Chat mode**

```typescript
const uni = new UniAI({ Google: { GOOGLE_AI_API, GOOGLE_AI_KEY } })
const res = await uni.chat(input, { stream: true, provider: ModelProvider.Google, model: GoogleChatModel.GEM_PRO })
const stream = res as Readable
let data = ''
stream.on('data', chunk => (data += JSON.parse(chunk.toString()).content))
stream.on('end', () => console.log(data))
```

**OUTPUT**

```
Language model trained by Google, at your service.
```
