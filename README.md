<!-- @format -->

<p align="center"><img src="./icon/logo.png" width="100px"></p>
<h1 align="center">UniAI</h1>
<h4 align="center">To Unify AI Models!</h4>

UniAI is a comprehensive library designed to streamline the integration of various AI models through a simple and unified interface. Our primary aim is to provide a cohesive platform for easy access to a wide spectrum of AI capabilities.

```typescript
const ai = new UniAI({ OpenAI: { key, proxy } })
const chat = await ai.chat('hello world')
const embedding = await ai.embedding('hello world')
```

[🇨🇳 中文说明](./README_CN.md)

## Supported Models

<p align="center">
<img src="./icon/xunfei.png" width="45px">
<img src="./icon/openai.png" width="45px">
<img src="./icon/google.png" width="45px">
<img src="./icon/baidu.png" width="45px">
<img src="./icon/moon.png" width="45px">
</p>

-   [IFLYTEK/Spark](https://xinghuo.xfyun.cn)
-   [THUDM/ChatGLM-6B](https://github.com/THUDM/ChatGLM4)
-   [ZHIPU/GLM3-4](https://open.bigmodel.cn)
-   [OpenAI/GPT](https://platform.openai.com)
-   [Baidu/WenXin Workshop](https://cloud.baidu.com/product/wenxinworkshop)
-   [Google/Gemini](https://makersuite.google.com/app/)
-   [MoonShot/moonshot](https://platform.moonshot.cn/docs)
-   [GanymedeNil/text2vec-large-chinese](https://huggingface.co/GanymedeNil/text2vec-large-chinese)
-   [Stable Diffusion](https://github.com/AUTOMATIC1111/stable-diffusion-webui)
-   [OpenAI/DALL-E](https://platform.openai.com)
-   [Midjourney](https://github.com/novicezk/midjourney-proxy)

## Installation

**Using yarn:**

```bash
yarn add uniai
```

**Using npm:**

```bash
npm install uniai
```

## Example

### Listing Supported Models

You can use `.models` to list all the available models in UniAI.

TypeScript & JavaScript ES6+

```typescript
import UniAI from 'uniai'

const ai = new UniAI()
console.log(ai.models)
```

JavaScript ES5

```javascript
const UniAI = require('uniai').default
const ai = new UniAI()
console.log(ai.models)
```

Output:

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
        "provider": "Google",
        "value": "google",
        "models": ["gemini-pro", "gemini-pro-vision", "gemini-ultra"]
    },
    ...
    {
        "provider": "Other",
        "value": "other",
        "models": []
    }
]
```

### Chat with Models

To interact with a model, use `.chat()` and remember to provide the required API key or secret parameters when initializing `new UniAI()`.

Default model is OpenAI/gpt-3.5-turbo, put the OpenAI key and your proxy API.

```typescript
const key = // Your OpenAI Key (required)
const proxy = // Your OpenAI API proxy (optional)
const uni = new UniAI({ OpenAI: { key, proxy } })
const res = await uni.chat()
console.log(res)
```

Output:

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

### Streaming Chat

For streaming chat, the response is a JSON buffer.

The following is an example to chat with Google gemini-pro in stream mode.

```typescript
const api = // Your google api proxy (optional)
const key = // Your google api key (required)
const uni = new UniAI({ Google: { key, proxy } })
const res = await uni.chat(input, { stream: true, provider: ModelProvider.Google, model: GoogleChatModel.GEM_PRO })
const stream = res as Readable
let data = ''
stream.on('data', chunk => (data += JSON.parse(chunk.toString()).content))
stream.on('end', () => console.log(data))
```

Output:

```
Language model trained by Google, at your service.
```

## Running Tests

UniAI uses `jest` to run unit tests on all supported models.

```bash
yarn test
```

If you want to run unit tests for a specific model provider:

```bash
# OpenAI, Google, Baidu, IFlyTek, MoonShot, GLM, Other
yarn test OpenAI
```

## Thanks

[Institute of Intelligent Computing Technology, Suzhou, CAS](http://iict.ac.cn/)

## Contributors

[Youwei Huang](https://github.com/devilyouwei)

huangyw@iict.ac.cn

## License

[MIT](./LICENSE)

Copyright (c) 2022-present, Youwei Huang
