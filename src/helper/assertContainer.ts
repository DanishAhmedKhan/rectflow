import { RectflowError } from '../error/RectflowError'
import { ErrorCode } from '../error/ErrorCode'

export function assertContainer(container: HTMLElement | null): asserts container is HTMLElement {
    if (!container) {
        throw new RectflowError('Container is null or undefined', ErrorCode.CONTAINER_NOT_FOUND)
    }

    if (!(container instanceof HTMLElement)) {
        throw new RectflowError('Provided container is not a valid HTMLElement', ErrorCode.INVALID_CONTAINER)
    }
}
