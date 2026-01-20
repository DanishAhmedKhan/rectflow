import { RectflowContext } from './RectflowContext'
import { RectflowError } from '../error/RectflowError'
import type { RectflowOptions } from '../types/RectflowOptions'
import type { LayoutConfig } from '../types/LayoutConfig'

export class Rectflow {
    private readonly options: RectflowOptions
    private context: RectflowContext

    constructor(options: RectflowOptions) {
        this.context = new RectflowContext(options)
        this.options = this.context.options

        const { container } = this.context.options
        container.style.position = 'absolute'

        this.context.onLayoutChange = () => {
            // this.applyLayout()
            this.context.areaRenderer.apply()
            this.context.resizeManager.apply()
        }

        this.applyLayout()
    }

    private applyLayout() {
        try {
            this.context.areaTopology.calculate()
            this.context.layoutEngine.calculate()
            this.context.areaRenderer.apply()
            this.context.resizeManager.apply()
        } catch (err) {
            this.handleError(err)
        }
    }

    public setLayout(layout: LayoutConfig) {
        try {
            this.context.layoutEngine.setLayout(layout)
            this.applyLayout()
        } catch (err) {
            this.handleError(err)
        }
    }

    public getArea(area: string) {
        return this.context.areaRenderer.getAreaElement(area)
    }

    private handleError(err: unknown) {
        if (this.options.strict) throw err

        if (err instanceof RectflowError) {
            console.error(err.message, err.code)
        } else {
            console.error('[Rectflow] Unknown error', err)
        }
    }
}
