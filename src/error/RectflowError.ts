import type { ErrorCode } from './ErrorCode'

export class RectflowError extends Error {
    readonly code: ErrorCode

    constructor(message: string, code: ErrorCode) {
        super(`[Rectflow] ${message}`)
        this.name = 'RectflowError'
        this.code = code
    }
}
