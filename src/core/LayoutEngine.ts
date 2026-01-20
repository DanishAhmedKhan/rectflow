import { Rect } from './Rect'
import type { RectflowContext } from './RectflowContext'
import type { ComputedRect, LayoutConfig } from '../types/LayoutConfig'

export class LayoutEngine {
    public computedRect: ComputedRect = {}

    constructor(private context: RectflowContext) {}

    public setLayout(layout: LayoutConfig) {
        this.context.options.layout = layout
        this.calculate()
    }

    public calculate() {
        this.computedRect = {}

        const container = this.context.options.container
        const layout = this.context.options.layout
        const boxes = this.context.areaTopology.boxes
        const gap = layout.gap ?? 0

        const rows = this.parseTracks(layout.rows, container.clientHeight, gap)
        const cols = this.parseTracks(layout.columns, container.clientWidth, gap)

        const rowOffsets = this.accumulate(rows, gap)
        const colOffsets = this.accumulate(cols, gap)

        for (const name in boxes) {
            const span = boxes[name]

            const x = colOffsets[span.colStart]
            const y = rowOffsets[span.rowStart]

            let width = 0
            for (let c = span.colStart; c <= span.colEnd; c++) {
                width += cols[c]
                if (c < span.colEnd) width += gap
            }

            let height = 0
            for (let r = span.rowStart; r <= span.rowEnd; r++) {
                height += rows[r]
                if (r < span.rowEnd) height += gap
            }

            this.computedRect[name] = new Rect({ x, y, width, height })
        }
    }

    private parseTracks(def: string, total: number, gap: number): number[] {
        const parts = def.split(/\s+/)

        let fixed = 0
        let frUnits = 0

        for (const p of parts) {
            if (p.endsWith('px')) {
                fixed += parseFloat(p)
            } else if (p.endsWith('fr')) {
                frUnits += parseFloat(p)
            } else if (p === 'auto') {
                frUnits += 1
            }
        }

        const remaining = total - fixed - (parts.length - 1) * gap

        const frUnit = frUnits > 0 ? remaining / frUnits : 0

        return parts.map((p) => {
            if (p.endsWith('px')) return parseFloat(p)
            if (p.endsWith('fr')) return parseFloat(p) * frUnit
            if (p === 'auto') return frUnit
            return 0
        })
    }

    private accumulate(sizes: number[], gap: number): number[] {
        const offsets: number[] = []
        let current = 0
        for (const s of sizes) {
            offsets.push(current)
            current += s + gap
        }
        return offsets
    }
}
