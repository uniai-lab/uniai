/** @format */
import axios, { AxiosRequestConfig } from 'axios'

export default {
    /**
     * Performs an HTTP GET request.
     *
     * @param url - The URL to make the request to.
     * @param params - Optional request parameters.
     * @param config - Optional Axios request configuration.
     * @returns A Promise that resolves with the response data.
     */
    async get<RequestT, ResponseT>(url: string, params?: RequestT, config?: AxiosRequestConfig) {
        return (await axios.get<ResponseT>(url, { params, ...config })).data
    },

    /**
     * Performs an HTTP POST request.
     *
     * @param url - The URL to make the request to.
     * @param body - The request body.
     * @param config - Optional Axios request configuration.
     * @returns A Promise that resolves with the response data.
     */
    async post<RequestT, ResponseT>(url: string, body?: RequestT, config?: AxiosRequestConfig) {
        return (await axios.post<ResponseT>(url, body, config)).data
    },
    /**
     * Parses JSON from a string and returns it as a generic type T.
     *
     * @param str - The JSON string to parse.
     * @returns The parsed JSON as a generic type T.
     */
    json<T>(str?: string | null) {
        try {
            if (!str) return null
            return JSON.parse(str) as T
        } catch (e) {
            return null
        }
    },
    getRandom<T>(arr: T[]): T {
        return arr[Math.floor(Math.random() * arr.length)]
    }
}
