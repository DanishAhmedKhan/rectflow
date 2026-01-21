import { OptinResolver } from './OptionResolver'
import { AreaTopology } from './AreaTopology'
import { LayoutEngine } from './LayoutEngine'
import { AreaRenderer } from './AreaRenderer'
import { ResizeManager } from './ResizeManager'
import type { RectflowOptions, ResolvedRectflowOptions } from '../types/RectflowOptions'

export class RectflowContext {
    public readonly options: ResolvedRectflowOptions

    public areaTopology!: AreaTopology
    public layoutEngine!: LayoutEngine
    public areaRenderer!: AreaRenderer
    public resizeManager!: ResizeManager

    public onLayoutChange?: () => void

    constructor(rawOptions: RectflowOptions) {
        const optionResolver = new OptinResolver()
        this.options = optionResolver.resolve(rawOptions)

        this.init()
    }

    public init() {
        this.areaTopology = new AreaTopology(this)
        this.layoutEngine = new LayoutEngine(this)
        this.areaRenderer = new AreaRenderer(this)
        this.resizeManager = new ResizeManager(this)
    }
}
