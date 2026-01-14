import { AreaTopology } from './AreaTopology'
import { LayoutEngine } from './LayoutEngine'
import { AreaRenderer } from './AreaRenderer'
import { ResizeManager } from './ResizeManager'
import { deepMerge } from '../helper/deepMerge'
import { assertContainer } from '../helper/assertContainer'
import { assertLayoutConfig } from '../helper/assertLayoutConfig'
import { RECTFLOW_DEFAULTS } from '../defaults/rectflowDefaults'
import type { RectflowOptions, ResolvedRectflowOptions } from '../types/RectflowOptions'
import type { Resolved } from '../types/Resolved'

export class RectflowContext {
    public readonly options: Resolved<ResolvedRectflowOptions>

    public areaTopology!: AreaTopology
    public layoutEngine!: LayoutEngine
    public areaRenderer!: AreaRenderer
    public resizeManager!: ResizeManager

    public onLayoutChange?: () => void

    constructor(rawOptions: RectflowOptions) {
        const resolved = this.resolveOptions(rawOptions)
        this.options = resolved

        this.initContainerStyle()

        this.init()
    }

    public init() {
        this.areaTopology = new AreaTopology(this)
        this.layoutEngine = new LayoutEngine(this)
        this.areaRenderer = new AreaRenderer(this)
        this.resizeManager = new ResizeManager(this)
    }

    private resolveOptions(options: RectflowOptions): ResolvedRectflowOptions {
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

    private initContainerStyle() {
        const { container } = this.options
        container.style.position = 'absolute'
    }
}
