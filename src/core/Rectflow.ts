import { RectflowContext } from './RectflowContext'
import type { RectflowOptions } from '../types/RectflowOptions'
import { handleError } from '../helper/handleError'

export class Rectflow {
    private context: RectflowContext

    constructor(options: RectflowOptions) {
        this.context = new RectflowContext(options)

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
            handleError(err, this.context.options.strict)
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

    public getArea(area: string) {
        return this.context.areaRenderer.getAreaElement(area)
    }
}
