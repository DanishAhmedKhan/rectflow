import { LayoutEngine } from './LayoutEngine'
import type { RectflowConfig } from './Rectflow'
import type { Rect } from './Grid'

type AreaEntry = {
    elem: HTMLElement
    auto: boolean
}

export class AreaRenderer {
    private areas = new Map<string, AreaEntry>()

    private engine: LayoutEngine

    constructor(private readonly config: RectflowConfig) {
        this.engine = new LayoutEngine(config.layout)
    }

    public registerArea(name: string, elem: HTMLElement) {
        const existing = this.areas.get(name)

        if (existing?.auto) {
            existing.elem.remove()
        }

        elem.style.position = 'absolute'

        this.areas.set(name, {
            elem,
            auto: false,
        })
    }

    public layout() {
        const rect: Rect = {
            x: 0,
            y: 0,
            width: this.config.container.clientWidth,
            height: this.config.container.clientHeight,
        }

        const layout = this.engine.compute(rect)

        for (const name in layout) {
            const elem = this.ensureArea(name)
            const r = layout[name]

            Object.assign(elem.style, {
                left: `${r.x}px`,
                top: `${r.y}px`,
                width: `${r.width}px`,
                height: `${r.height}px`,
            })
        }
    }

    private ensureArea(name: string): HTMLElement {
        function randomColor(): string {
            const hue = Math.floor(Math.random() * 360)
            return `hsl(${hue}, 70%, 70%)`
        }

        const existing = this.areas.get(name)
        if (existing) return existing.elem

        const elem = document.createElement('div')
        elem.dataset.rectflowArea = name
        elem.style.background = randomColor()
        elem.style.position = 'absolute'

        this.config.container.appendChild(elem)

        this.areas.set(name, { elem, auto: true })

        return elem
    }

    public clearArea() {
        this.areas.clear()
    }
}
