import { AreaRenderer } from './AreaRenderer'
import { LayoutEngine } from './LayoutEngine'
import { RectflowError } from '../error/RectflowError'
import { assertContainer } from '../helper/assertContainer'
import { assertLayoutConfig } from '../helper/assertLayoutConfig'
import type { RectflowOptions } from '../types/RectflowOptions'
import type { LayoutConfig } from '../types/LayoutConfig'
import type { Resolved } from '../types/Resolved'

export class Rectflow {
    private readonly options: Resolved<RectflowOptions>

    private areaRenderer!: AreaRenderer
    private observer!: ResizeObserver

    constructor(options: RectflowOptions) {
        assertContainer(options.container)
        assertLayoutConfig(options.layout)

        this.options = {
            ...options,
            container: options.container,
            strict: options.strict ?? true,
        }

        options.container.style.position = 'relative'

        this.init()
    }

    private init() {
        try {
            this.areaRenderer = new AreaRenderer(this.options)
            this.layout()

            this.observer = new ResizeObserver(() => this.layout())
            this.observer.observe(this.options.container!)
        } catch (err) {
            if (this.options.strict) throw err

            if (err instanceof RectflowError) {
                console.error(err.message, err.code)
            } else {
                console.error('[Rectflow] Unknown error', err)
            }
        }
    }

    public registerArea(area: string, elem: HTMLElement) {
        this.areaRenderer.registerArea(area, elem)
    }

    public setLayout(layout: LayoutConfig) {
        assertLayoutConfig(layout)
        this.options.layout = layout
        this.layout()
    }

    public getArea(area: string) {
        return this.areaRenderer.getArea(area)
    }

    public layout() {
        const rects = LayoutEngine.calculate(this.options.layout, {
            x: 0,
            y: 0,
            width: this.options.container.clientWidth,
            height: this.options.container.clientHeight,
        })

        this.areaRenderer.applyRects(rects)
    }

    public destroy() {
        this.observer.disconnect()
        this.areaRenderer.clear()
    }
}
