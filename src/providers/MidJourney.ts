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

import { MJTaskEnum, MidJourneyImagineModel } from '../../interface/Enum'
import { MJChangeRequest, MJImagineRequest, MJImagineResponse, MJTaskResponse } from '../../interface/IMidJourney'
import { ImagineResponse, TaskResponse } from '../../interface/IModel'
import $ from '../util'

export default class MidJourney {
    private proxy?: string // Proxy address of MidJourney
    private token?: string // User token of MidJourney

    constructor(proxy?: string, token?: string) {
        this.proxy = proxy
        this.token = token
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
        width: number = 1,
        height: number = 1
    ): Promise<ImagineResponse> {
        const aspect = $.getAspect(width, height)
        const res = await $.post<MJImagineRequest, MJImagineResponse>(
            `${this.proxy}/mj/submit/imagine`,
            { prompt: `${prompt} --ar ${aspect} ${nPrompt ? '--no ' + nPrompt : ''}` },
            { headers: { 'mj-api-secret': this.token } }
        )
        if (res.code !== 1) throw new Error(res.description)
        return { taskId: res.result, time: new Date() }
    }

    /**
     * Get task information by id or get a list of imagining tasks.
     * @param id - The task id. If provided, it will return the task information with the specified id. Otherwise, it will return the task list.
     * @returns The task list or the task information with the specified id.
     */
    async task(id?: string): Promise<TaskResponse[]> {
        if (id) {
            const res = await $.get<null, MJTaskResponse>(`${this.proxy}/mj/task/${id}/fetch`, null, {
                headers: { 'mj-api-secret': this.token }
            })
            return [
                {
                    id: res.id,
                    imgs: [res.imageUrl],
                    info: res.description,
                    fail: res.failReason,
                    progress: parseInt(res.progress),
                    created: new Date(res.startTime),
                    model: MidJourneyImagineModel.MJ
                }
            ]
        } else {
            const res = await $.get<null, MJTaskResponse[]>(`${this.proxy}/mj/task/list`, null, {
                headers: { 'mj-api-secret': this.token }
            })
            return res.map(v => ({
                id: v.id,
                imgs: [v.imageUrl],
                info: v.description,
                fail: v.failReason,
                progress: parseInt(v.progress),
                created: new Date(v.startTime),
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
    change(taskId: string, action: MJTaskEnum, index?: number) {
        return $.post<MJChangeRequest, MJImagineResponse>(
            `${this.proxy}/mj/submit/change`,
            { taskId, action, index },
            { headers: { 'mj-api-secret': this.token } }
        )
    }

    /**
     * Get the information of imagine task queue.
     * @returns The detailed information of the task queue.
     */
    queue() {
        return $.get<null, MJTaskResponse[]>(`${this.proxy}/mj/task/queue`, null, {
            headers: { 'mj-api-secret': this.token }
        })
    }
}
