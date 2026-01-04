import { RectflowError } from '../error/RectflowError'
import { ErrorCode } from '../error/ErrorCode'
import type { LayoutConfig } from '../types/LayoutConfig'

export function assertLayoutConfig(config: LayoutConfig): void {
    if (!config) {
        throw new RectflowError('Grid config is required', ErrorCode.INVALID_GRID_CONFIG)
    }

    const { rows, columns, areas } = config

    if (!rows || !columns) {
        throw new RectflowError('Grid config must define rows and columns', ErrorCode.INVALID_GRID_CONFIG)
    }

    if (!Array.isArray(areas) || areas.length === 0) {
        throw new RectflowError('Grid areas must be a non-empty 2D array', ErrorCode.INVALID_GRID_AREAS)
    }

    const columnCount = areas[0].length

    for (const row of areas) {
        if (row.length !== columnCount) {
            throw new RectflowError('All grid area rows must have equal column count', ErrorCode.INVALID_GRID_AREAS)
        }
    }
}
