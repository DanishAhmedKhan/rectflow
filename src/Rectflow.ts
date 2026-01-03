import { AreaRenderer } from './AreaRenderer'
import { RectflowError } from './error/RectflowError'
import type { GridConfig } from './Grid'
import { assertContainer } from './helper/assertContainer'
import { assertGridConfig } from './helper/assertGridConfig'
import type { RectflowOptions } from './RectflowOptions'
import type { Resolved } from './types/Resolved'

export class Rectflow {
    private readonly options: Resolved<RectflowOptions>

    private areaRenderer!: AreaRenderer
    private observer!: ResizeObserver

    constructor(options: RectflowOptions) {
        assertContainer(options.container)
        assertGridConfig(options.layout)

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
            this.areaRenderer.layout()

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

    public setLayout(layout: GridConfig) {
        assertGridConfig(layout)
        this.areaRenderer.updateLayout()
    }

    public getArea(area: string) {
        return this.areaRenderer.getArea(area)
    }

    public layout() {
        this.areaRenderer.layout()
    }

    public destroy() {
        this.observer.disconnect()
        this.areaRenderer.clearArea()
    }
}
