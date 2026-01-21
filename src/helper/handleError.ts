import { RectflowError } from '../error/RectflowError'

export const handleError = (err: unknown, strict: boolean = true) => {
    if (strict) throw err

    if (err instanceof RectflowError) {
        console.error(err.message, err.code)
    } else {
        console.error('[Rectflow] Unknown error', err)
    }
}
