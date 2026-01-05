import { RectflowContext } from './RectflowContext'
import { AreaRenderer } from './AreaRenderer'
import { ResizeManager } from './ResizeManager'
import { RectflowError } from '../error/RectflowError'
import type { RectflowOptions } from '../types/RectflowOptions'
import type { LayoutConfig } from '../types/LayoutConfig'

export class Rectflow {
    private readonly options: RectflowOptions

    private context: RectflowContext
    private areaRenderer!: AreaRenderer
    private resizeManager!: ResizeManager
    private observer!: ResizeObserver

    constructor(options: RectflowOptions) {
        this.options = options
        this.context = new RectflowContext(options)

        this.process()
    }

    private process() {
        try {
            this.areaRenderer = new AreaRenderer(this.context)
            this.resizeManager = new ResizeManager(this.context)

            this.applyCurrentLayout()
        } catch (err) {
            if (this.options.strict) throw err

            if (err instanceof RectflowError) {
                console.error(err.message, err.code)
            } else {
                console.error('[Rectflow] Unknown error', err)
            }
        }
    }

    private applyCurrentLayout() {
        const computedLayout = this.context.layoutEngine.calculate()
        this.areaRenderer.applyLayout(computedLayout)
    }

    private handleError(err: unknown) {
        if (this.options.strict) throw err

        if (err instanceof RectflowError) {
            console.error(err.message, err.code)
        } else {
            console.error('[Rectflow] Unknown error', err)
        }
    }

    public registerArea(area: string, elem: HTMLElement) {
        this.areaRenderer.registerArea(area, elem)
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
        return this.areaRenderer.getArea(area)
    }

    public destroy() {
        this.observer.disconnect()
        this.areaRenderer.clear()
    }
}
