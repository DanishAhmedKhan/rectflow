import type { GridConfig, Rect } from './Grid'
import { LayoutEngine } from './LayoutEngine'

export class Rectflow {
    private container: HTMLElement
    private areas = new Map<string, HTMLElement>()

    private engine: LayoutEngine

    constructor(container: HTMLElement, config: GridConfig) {
        this.container = container
        this.engine = new LayoutEngine(config)

        this.container.style.position = 'relative'
    }

    public registerArea(area: string, elem: HTMLElement) {
        elem.style.position = 'absolute'
        this.areas.set(area, elem)
    }

    public layout() {
        const rect: Rect = {
            x: 0,
            y: 0,
            width: this.container.clientWidth,
            height: this.container.clientHeight,
        }

        const computed = this.engine.compute(rect)

        for (const [name, el] of this.areas) {
            const r = computed[name]
            if (!r) continue

            el.style.left = `${r.x}px`
            el.style.top = `${r.y}px`
            el.style.width = `${r.width}px`
            el.style.height = `${r.height}px`
        }
    }
}
