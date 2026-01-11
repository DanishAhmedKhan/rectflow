import { RectflowContext } from './RectflowContext'
import { RectflowError } from '../error/RectflowError'
import type { RectflowOptions } from '../types/RectflowOptions'
import type { LayoutConfig } from '../types/LayoutConfig'

export class Rectflow {
    private readonly options: RectflowOptions
    private context: RectflowContext

    private observer!: ResizeObserver

    constructor(options: RectflowOptions) {
        this.options = options
        this.context = new RectflowContext(options)

        this.process()
    }

    private process() {
        try {
            this.context.onLayoutChange = () => {
                this.context.areaRenderer.apply()
            }

            this.applyCurrentLayout()
        } catch (err) {
            this.handleError(err)
        }
    }

    private applyCurrentLayout() {
        this.context.areaRenderer.apply()
        this.context.resizeManager.apply()
    }

    public setLayout(layout: LayoutConfig) {
        try {
            this.context.layoutEngine.setLayout(layout)
            this.applyCurrentLayout()
        } catch (err) {
            this.handleError(err)
        }
    }

    public getArea(area: string) {
        return this.context.areaRenderer.getAreaElement(area)
    }

    public destroy() {
        this.observer.disconnect()
        this.context.areaRenderer.clear()
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
