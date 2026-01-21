import { AreaTopology } from './AreaTopology'
import { LayoutEngine } from './LayoutEngine'
import { AreaRenderer } from './AreaRenderer'
import { ResizeManager } from './ResizeManager'
import type { RectflowOptions } from '../types/RectflowOptions'
import { RectflowOptionsStore } from './RectflowOptionsStore'

export class RectflowContext {
    public readonly optionsStore: RectflowOptionsStore

    public areaTopology: AreaTopology
    public layoutEngine: LayoutEngine
    public areaRenderer: AreaRenderer
    public resizeManager: ResizeManager

    public onLayoutChange?: () => void

    constructor(rawOptions: RectflowOptions) {
        this.optionsStore = new RectflowOptionsStore(rawOptions)

        this.areaTopology = new AreaTopology(this)
        this.layoutEngine = new LayoutEngine(this)
        this.areaRenderer = new AreaRenderer(this)
        this.resizeManager = new ResizeManager(this)
    }

    get options() {
        return this.optionsStore.options
    }
}
