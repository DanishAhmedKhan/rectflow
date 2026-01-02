import type { GridConfig, Rect } from './Grid'
import { LayoutEngine } from './LayoutEngine'

export class Rectflow {
    private container: HTMLElement
    private areas = new Map<string, HTMLElement>()
    // private handlers = new Map<LayoutEvent, Set<Handler>>()

    private engine: LayoutEngine

    constructor(container: HTMLElement, config: GridConfig) {
        this.container = container
        this.engine = new LayoutEngine(config)

        this.container.style.position = 'relative'
    }

    /* ---------- Public API ---------- */

    public registerArea(area: string, elem: HTMLElement) {
        elem.style.position = 'absolute'
        this.areas.set(area, elem)
        // this.layout()
    }

    // public unregister(area: string) {
    //     this.elements.delete(area)
    //     this.layout()
    // }

    // public updateConfig(config: LayoutConfig) {
    //     this.config = config
    //     this.layout()
    // }

    public layout() {
        const rect: Rect = {
            x: 0,
            y: 0,
            width: this.container.clientWidth,
            height: this.container.clientHeight,
        }

        // console.log(rect)

        const computed = this.engine.compute(rect)

        for (const [name, el] of this.areas) {
            const r = computed[name]
            if (!r) continue

            el.style.left = `${r.x}px`
            el.style.top = `${r.y}px`
            el.style.width = `${r.width}px`
            el.style.height = `${r.height}px`
        }

        console.log('layout')
    }

    // public destroy() {
    //     window.removeEventListener('resize', this.onResize)
    //     this.elements.clear()
    //     this.emit('destroy')
    // }

    // public on(event: LayoutEvent, handler: Handler) {
    //     if (!this.handlers.has(event)) {
    //         this.handlers.set(event, new Set())
    //     }
    //     this.handlers.get(event)!.add(handler)
    // }

    // off(event: LayoutEvent, handler: Handler) {
    //     this.handlers.get(event)?.delete(handler)
    // }
}
