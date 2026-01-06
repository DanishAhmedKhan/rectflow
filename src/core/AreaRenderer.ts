import { randomColor } from '../helper/randomColor'
import type { ResolvedRectflowOptions } from '../types/RectflowOptions'
import type { ComputedLayout, Rect } from '../types/LayoutConfig'
import type { RectflowContext } from './RectflowContext'

type AreaEntry = {
    elem: HTMLElement
    auto: boolean
    active: boolean
}

export class AreaRenderer {
    private readonly options: ResolvedRectflowOptions
    private areas = new Map<string, AreaEntry>()

    constructor(private context: RectflowContext) {
        this.options = context.options
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
            active: true,
        })

        const rect = this.context.computedLayout?.[name]
        if (rect) this.applyLayoutStyles(elem, rect)

        this.options.container.appendChild(elem)
    }

    public applyLayout(computerLayout: ComputedLayout) {
        const activeAreas = new Set(Object.keys(computerLayout))

        for (const [name, entry] of this.areas) {
            if (!activeAreas.has(name)) {
                if (entry.auto && entry.active) {
                    entry.elem.remove()
                    entry.active = false
                }
            }
        }

        for (const name in computerLayout) {
            const rect = computerLayout[name]
            const entry = this.ensureArea(name)

            if (!entry.active) {
                this.options.container.appendChild(entry.elem)
                entry.active = true
            }

            this.applyLayoutStyles(entry.elem, rect)
        }
    }

    public getArea(area: string) {
        return this.areas.get(area)?.elem
    }

    public clear() {
        for (const { elem } of this.areas.values()) {
            elem.remove()
        }
        this.areas.clear()
    }

    private ensureArea(name: string): AreaEntry {
        const existing = this.areas.get(name)
        if (existing) return existing

        const elem = document.createElement('div')
        elem.innerHTML = name
        elem.dataset.rectflowArea = name
        elem.style.position = 'absolute'
        elem.style.background = randomColor()

        const entry: AreaEntry = {
            elem,
            auto: true,
            active: false,
        }

        this.areas.set(name, entry)
        return entry
    }

    private applyLayoutStyles(elem: HTMLElement, rect: Rect) {
        elem.style.left = rect.x + 'px'
        elem.style.top = rect.y + 'px'
        elem.style.width = rect.width + 'px'
        elem.style.height = rect.height + 'px'
    }
}
