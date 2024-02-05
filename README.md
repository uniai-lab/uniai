<!-- @format -->

<p align="center"><img src="./icon/logo.png" width="100px"></p>
<h1 align="center">UniAI</h1>
<h4 align="center">To Unify AI Models!</h4>

<p>
UniAI, built on Node.js, serves as an integrated AI model library. It provides a unified interface for various leading models, streamlining the development process by ensuring a consistent model input and output experience.
</p>

<img width='100%' src='./example/example.gif'/>

```typescript
import UniAI from 'uniai'
// fill the config for the provider/model you want to use!
const ai = new UniAI({ OpenAI: { key: 'Your key', proxy: 'Your proxy API' } })
// chat model
const chat = await ai.chat('hello world')
// embedding model
const embedding = await ai.embedding('hello world')
// imagine model
const task = await ai.imagine('a panda is eating bamboo')
const image = await ai.task(task.taskId)
```

English · [🇨🇳 中文说明](./README_CN.md)

## Supported Models

<p align="left">
<img src="./icon/xunfei.png" width="45px">
<img src="./icon/openai.png" width="45px">
<img src="./icon/google.png" width="45px">
<img src="./icon/zhipu.png" width="45px">
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
-   [OpenAI/DALL-E](https://platform.openai.com)
-   [MidJourney](https://github.com/novicezk/midjourney-proxy)
-   [Stability AI](https://platform.stability.ai/docs/getting-started)
-   [Stable Diffusion](https://github.com/AUTOMATIC1111/stable-diffusion-webui)
-   [GanymedeNil/text2vec-large-chinese](https://huggingface.co/GanymedeNil/text2vec-large-chinese)

## Project structure

```javascript
├─example         //A simple example of calling
├─icon            //The placement of each model icon
├─interface       //Interface Placement Directory
├─src
│  └─providers    //Each model provider
└─test            //Automated test case
```

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

> We have written a simple call demo for you, which is placed in the `/examples` folder. You can read the `/examples` file directly to learn how to use UniAI.
> You can also read on to learn how to use UniAI based on the documentation.

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
    // ...
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
const key: string | string[] = 'Your OpenAI Key (required), support multi keys'
const proxy = 'Your OpenAI API proxy (optional)'
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
const key: string | string[] = 'Your Google Key (required), support multi keys'
const proxy = 'Your google api proxy (optional)'
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

## Participate in development

We welcome any type of PR as well as issue.

## Contributors

[Youwei Huang](https://github.com/devilyouwei)

[Weilong Yu](https://github.com/mrkk1)

huangyw@iict.ac.cn

## Who is using it

|                       Project                       |                                          Brief introduction                                           |
| :-------------------------------------------------: | :---------------------------------------------------------------------------------------------------: |
| [UniAI MaaS](https://github.com/uni-openai/UniAI/)  | UniAI is a unified API platform designed to simplify interaction with a variety of complex AI models. |
| [LeChat](https://github.com/CAS-IICT/lechat-uniapp) |         Document analysis based on large language model, dialogue with WeChat Mini Programs.          |
|      [LeChat Pro](https://lechat.cas-ll.cn/#/)      |             Full-platform client based on UniAI, multi-model streaming dialogue platform.             |

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=devilyouwei/UniAI&type=Timeline)](https://star-history.com/#devilyouwei/UniAI&Timeline)

## License

[MIT](./LICENSE)

Copyright (c) 2022-present, Youwei Huang
