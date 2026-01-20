import { RECTFLOW_DEFAULTS } from '../defaults/rectflowDefaults'
import { assertContainer } from '../helper/assertContainer'
import { assertLayoutConfig } from '../helper/assertLayoutConfig'
import { deepMerge } from '../helper/deepMerge'
import type { RectflowOptions, ResolvedRectflowOptions } from '../types/RectflowOptions'

export class OptinResolver {
    public resolve(options: RectflowOptions): ResolvedRectflowOptions {
        this.normalizeContainer(options)
        this.normalizeLayout(options)
        this.normalizeAreas(options)
        this.normalizeGutter(options)

        const resolvedOptions = deepMerge(RECTFLOW_DEFAULTS, options as ResolvedRectflowOptions)

        assertContainer(resolvedOptions.container)
        assertLayoutConfig(resolvedOptions.layout)

        return resolvedOptions
    }

    private normalizeContainer(options: RectflowOptions) {
        const container = options.container

        if (typeof container === 'string') {
            options.container = document.querySelector<HTMLElement>(container)
        }
    }

    private normalizeLayout(options: RectflowOptions) {
        const layout = options.layout

        if (!layout.gap) options.layout.gap = 0
    }

    private normalizeAreas(options: RectflowOptions) {
        const areas = options.layout.areas
        options.layout.areas = areas.map((row) => (row.length === 1 ? row[0].trim().split(/\s+/) : row))
    }

    private normalizeGutter(options: RectflowOptions) {
        if (!options.layout.resize) return
        const gutter = options.layout.resize.gutter

        if (typeof gutter === 'number') options.layout.resize.gutter = { size: 6 }
    }
}
