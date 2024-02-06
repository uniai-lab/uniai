/**
 * Class for interacting with Stability AI.
 *
 * To interact with Stability AI, refer to the documentation at: https://platform.stability.ai/docs/getting-started
 * You need to create an account and generate an API key to use this class.
 *
 * @format by prettier
 * @author devilyouwei
 */
import { SDTaskType, StabilityAIImagineModel } from '../../interface/Enum'
import { ImagineResponse, TaskResponse } from '../../interface/IModel'
import { StabilityImagineRequest, StabilityImagineResponse } from '../../interface/IStability'
import $ from '../util'

const API = 'https://api.stability.ai'
const STORAGE_KEY = 'task_stability_ai'

export default class Stability {
    private api?: string
    private key?: string | string[]

    constructor(key?: string | string[], api: string = API) {
        this.key = key
        this.api = api
    }

    /**
     * Generate images using Stability AI.
     *
     * @param prompt - The main text prompt for image generation.
     * @param negativePrompt - The negative text prompt (optional).
     * @param width - Image width (default: 1024).
     * @param height - Image height (default: 1024).
     * @param samples - Number of images to generate (default: 1).
     * @param model - The Stability AI model to use (default: StabilityAIImagineModel.SD_1_6).
     * @returns A promise resolving to the image generation response.
     */
    async imagine(
        prompt: string,
        negativePrompt: string = '',
        width: number = 1024,
        height: number = 1024,
        samples: number = 1,
        model: StabilityAIImagineModel = StabilityAIImagineModel.SD_1_6
    ): Promise<ImagineResponse> {
        const key = Array.isArray(this.key) ? $.getRandomKey(this.key) : this.key
        if (!key) throw new Error('Stability key is not set in config')
        const prompts = [{ text: prompt, weight: 1 }]
        if (negativePrompt) prompts.push({ text: negativePrompt, weight: -1 })

        const res = await $.post<StabilityImagineRequest, StabilityImagineResponse>(
            `${this.api}/v1/${SDTaskType.GENERATION}/${model}/text-to-image`,
            { width, height, samples, text_prompts: prompts },
            { headers: { Accept: 'application/json', Authorization: `Bearer ${key}` } }
        )

        const id = $.getRandomId()
        const imgs: string[] = []
        for (const i in res.artifacts) imgs.push(await $.writeFile(res.artifacts[i].base64, `${id}-${i}.png`))

        const time = Date.now()
        const task: TaskResponse = {
            id,
            type: SDTaskType.GENERATION,
            info: res.artifacts[0].finishReason,
            progress: 100,
            imgs,
            fail: '',
            created: time,
            model
        }

        const tasks: TaskResponse[] = $.getItem(STORAGE_KEY) || []
        tasks.push(task)
        $.setItem(STORAGE_KEY, tasks)
        return { taskId: task.id, time }
    }

    /**
     * Simulate tasks or retrieve a specific task by ID.
     *
     * @param id - The task ID to retrieve (optional).
     * @returns An array of task responses or a specific task by ID.
     */
    task(id?: string) {
        const tasks: TaskResponse[] = $.getItem(STORAGE_KEY) || []

        if (id) return tasks.filter(v => v.id === id)
        else return tasks
    }
}
