import { RectflowContext } from './RectflowContext'
import type { RectflowOptions } from '../types/RectflowOptions'
import type { LayoutConfig } from '../types/LayoutConfig'
import { handleError } from '../helper/handleError'

export class Rectflow {
    private readonly options: RectflowOptions
    private context: RectflowContext

    constructor(options: RectflowOptions) {
        this.context = new RectflowContext(options)
        this.options = this.context.options

        const { container } = this.context.options
        container.style.position = 'absolute'

        this.context.onLayoutChange = () => {
            this.context.layoutEngine.calculate()
            this.context.areaRenderer.apply()
            this.context.resizeManager.relayoutGutters()
        }

        try {
            this.initLayout()
            this.applyLayout()
        } catch (err) {
            handleError(err, this.options.strict)
        }
    }

    private initLayout() {
        this.context.areaTopology.calculate()
        this.context.layoutEngine.initTracks()
    }

    private applyLayout() {
        this.context.areaTopology.calculate()
        this.context.layoutEngine.calculate()
        this.context.areaRenderer.apply()
        this.context.resizeManager.apply()
    }

    public setLayout(layout: LayoutConfig) {
        try {
            this.context.layoutEngine.setLayout(layout)
            this.applyLayout()
        } catch (err) {
            handleError(err, this.options.strict)
        }
    }

    public getArea(area: string) {
        return this.context.areaRenderer.getAreaElement(area)
    }
}
