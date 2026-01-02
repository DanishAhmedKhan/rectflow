import { AreaRenderer } from './AreaRenderer'
import type { GridConfig } from './Grid'

export type RectflowConfig = {
    container: HTMLElement
    layout: GridConfig
}

export class Rectflow {
    private areaRenderer: AreaRenderer

    private observer: ResizeObserver

    constructor(config: RectflowConfig) {
        config.container.style.position = 'relative'

        this.areaRenderer = new AreaRenderer(config)

        this.observer = new ResizeObserver(() => this.layout())
        this.observer.observe(config.container)
    }

    public registerArea(area: string, elem: HTMLElement) {
        this.areaRenderer.registerArea(area, elem)
    }

    public layout() {
        this.areaRenderer.layout()
    }

    public destroy() {
        this.observer.disconnect()
        this.areaRenderer.clearArea()
    }
}
