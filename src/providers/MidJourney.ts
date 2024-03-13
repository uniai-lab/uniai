/**
 * Class for interacting with MidJourney using the midjourney-proxy API.
 *
 * Make sure to have the midjourney-proxy deployed before using this class.
 *
 * The midjourney-proxy project can be found at: https://github.com/novicezk/midjourney-proxy.git
 * If you already have a deployed proxy, provide the proxy URL when initializing the Midjourney class.
 *
 * @format by prettier
 * @author devilyouwei
 */

import { MJTaskType, MidJourneyImagineModel } from '../../interface/Enum'
import { MJChangeRequest, MJImagineRequest, MJImagineResponse, MJTaskResponse } from '../../interface/IMidJourney'
import { ImagineResponse, TaskResponse } from '../../interface/IModel'
import $ from '../util'

export default class MidJourney {
    private proxy?: string // Proxy address of MidJourney
    private token?: string // User token of MidJourney
    private imgProxy?: string // User token of MidJourney

    constructor(proxy?: string, token?: string, imgProxy?: string) {
        this.proxy = proxy
        this.token = token
        this.imgProxy = imgProxy
    }

    /**
     * Call the imagine API of MidJourney to generate text.
     * @param prompt - The input prompt text.
     * @param nPrompt - The excluded text.
     * @param width - The image width. Default value is 1.
     * @param height - The image height. Default value is 1.
     * @returns The generated text.
     */
    async imagine(
        prompt: string,
        nPrompt: string = '',
        width: number = 1024,
        height: number = 1024
    ): Promise<ImagineResponse> {
        if (!this.proxy) throw new Error('MidJourney image model proxy is not set in config')

        const aspect = $.getAspect(width, height)
        const res = await $.post<MJImagineRequest, MJImagineResponse>(
            `${this.proxy}/mj/submit/imagine`,
            { prompt: `${prompt} --ar ${aspect} ${nPrompt ? '--no ' + nPrompt : ''}` },
            { headers: { 'mj-api-secret': this.token } }
        )
        if (res.code !== 1) throw new Error(res.description)
        return { taskId: res.result, time: Date.now() }
    }

    /**
     * Get task information by id or get a list of imagining tasks.
     * @param id - The task id. If provided, it will return the task information with the specified id. Otherwise, it will return the task list.
     * @returns The task list or the task information with the specified id.
     */
    async task(id?: string): Promise<TaskResponse[]> {
        if (!this.proxy) throw new Error('MidJourney image model proxy is not set in config')

        if (id) {
            const res = await $.get<null, MJTaskResponse>(`${this.proxy}/mj/task/${id}/fetch`, null, {
                headers: { 'mj-api-secret': this.token }
            })
            // image proxy, replace hostname
            if (res.imageUrl && this.imgProxy) {
                const url = new URL(res.imageUrl)
                const pro = new URL(this.imgProxy)
                url.hostname = pro.hostname
                url.protocol = pro.protocol
                url.port = pro.port
                res.imageUrl = url.toString()
            }
            return [
                {
                    id: res.id,
                    type: res.action,
                    imgs: res.imageUrl ? [await $.writeFile(res.imageUrl, `${res.id}.png`)] : [],
                    info: res.description,
                    fail: res.failReason || '',
                    progress: parseInt(res.progress) || 0,
                    created: res.startTime,
                    model: MidJourneyImagineModel.MJ
                }
            ]
        } else {
            const res = await $.get<null, MJTaskResponse[]>(`${this.proxy}/mj/task/list`, null, {
                headers: { 'mj-api-secret': this.token }
            })
            return res.map(v => ({
                id: v.id,
                type: v.action,
                imgs: v.imageUrl ? [v.imageUrl] : [],
                info: v.description,
                fail: v.failReason || '',
                progress: parseInt(v.progress),
                created: v.startTime,
                model: MidJourneyImagineModel.MJ
            }))
        }
    }

    /**
     * Submit a change request for a imagined task.
     * @param taskId - The task id.
     * @param action - The action type of the task.
     * @param index - The index for modification (optional).
     * @returns The modified task response.
     */
    async change(taskId: string, action: MJTaskType, index?: number): Promise<ImagineResponse> {
        if (!this.proxy) throw new Error('MidJourney image model proxy is not set in config')

        const res = await $.post<MJChangeRequest, MJImagineResponse>(
            `${this.proxy}/mj/submit/change`,
            { taskId, action, index },
            { headers: { 'mj-api-secret': this.token } }
        )
        return { taskId: res.result, time: Date.now() }
    }
}
