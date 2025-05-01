/** @format */

export interface IAST {
    type: string
    depth?: number
    value?: string
    children?: IAST[]
}
