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
    },
    getRandomId(length = 16): string {
        let result = ''
        while (result.length < length) {
            let rand = Math.floor(Math.random() * 10)
            // Ensure the number doesn't start with zero
            if (result.length === 0 && rand === 0) continue
            // Append the number to the result string
            result += rand.toString()
        }
        return result
    },
    /**
     * Computes the greatest common divisor (GCD) of two numbers using Euclidean algorithm.
     *
     * @param a - The first number.
     * @param b - The second number.
     * @returns The GCD of the two numbers.
     */
    getGCD(a: number, b: number): number {
        if (b === 0) return a
        return this.getGCD(b, a % b)
    },
    /**
     * Calculates and returns the aspect ratio of a width and height.
     *
     * @param width - The width dimension.
     * @param height - The height dimension.
     * @returns The aspect ratio in the format "width:height".
     */
    getAspect(width: number, height: number) {
        if (!width || !height) return '1:1'

        const gcd = this.getGCD(width, height)
        const aspectRatioWidth = width / gcd
        const aspectRatioHeight = height / gcd

        return `${aspectRatioWidth}:${aspectRatioHeight}`
    }
}
