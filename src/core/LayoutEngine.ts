import type { ComputedLayout, LayoutConfig } from '../types/LayoutConfig'
import { Area } from './Area'

export class LayoutEngine {
    public computedLayout!: ComputedLayout

    constructor(private layout: LayoutConfig, private container: HTMLElement) {
        this.calculate()
    }

    public setLayout(layout: LayoutConfig) {
        this.layout = layout
        this.calculate()
    }

    public calculate() {
        const gap = this.layout.gap ?? 0

        const rect = {
            x: 0,
            y: 0,
            width: this.container.clientWidth,
            height: this.container.clientHeight,
        }

        const rows = this.parseTracks(this.layout.rows, rect.height, gap)
        const cols = this.parseTracks(this.layout.columns, rect.width, gap)

        const rowOffsets = this.accumulate(rows, gap)
        const colOffsets = this.accumulate(cols, gap)

        const areas = this.layout.areas
        const result: ComputedLayout = {}

        for (let r = 0; r < areas.length; r++) {
            for (let c = 0; c < areas[r].length; c++) {
                const name = areas[r][c]
                if (name === '.') continue

                if (!result[name]) {
                    result[name] = new Area({
                        name,
                        x: colOffsets[c],
                        y: rowOffsets[r],
                        width: cols[c],
                        height: rows[r],
                    })
                } else {
                    const rect = result[name]
                    if (colOffsets[c] + cols[c] > rect.x + rect.width) {
                        rect.width = colOffsets[c] + cols[c] - rect.x
                    }

                    if (rowOffsets[r] + rows[r] > rect.y + rect.height) {
                        rect.height = rowOffsets[r] + rows[r] - rect.y
                    }
                }
            }
        }

        this.computedLayout = result
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
