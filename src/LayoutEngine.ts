import type { GridConfig, Rect, ComputedLayout } from './Grid'

export class LayoutEngine {
    constructor(private config: GridConfig) {}

    compute(container: Rect): ComputedLayout {
        const rows = this.parseTracks(this.config.rows, container.height)
        const cols = this.parseTracks(this.config.columns, container.width)
        const gap = this.config.gap ?? 0

        const rowOffsets = this.accumulate(rows, gap)
        const colOffsets = this.accumulate(cols, gap)

        const areas = this.normalizeAreas(this.config.areas)
        const result: ComputedLayout = {}

        for (let r = 0; r < areas.length; r++) {
            for (let c = 0; c < areas[r].length; c++) {
                const name = areas[r][c]
                if (name === '.') continue

                if (!result[name]) {
                    result[name] = {
                        x: colOffsets[c],
                        y: rowOffsets[r],
                        width: cols[c],
                        height: rows[r],
                    }
                } else {
                    result[name].width += cols[c] + gap
                    result[name].height += rows[r] + gap
                }
            }
        }

        console.log(result)

        return result
    }

    private normalizeAreas(areas: string[][]): string[][] {
        return areas.map((row) => (row.length === 1 ? row[0].trim().split(/\s+/) : row))
    }

    private parseTracks(def: string, total: number): number[] {
        const parts = def.split(/\s+/)
        let fixed = 0
        let fr = 0

        for (const p of parts) {
            if (p.endsWith('px')) fixed += parseFloat(p)
            else if (p.endsWith('fr')) fr += parseFloat(p)
        }

        const remaining = total - fixed - (parts.length - 1) * (this.config.gap ?? 0)
        const frUnit = fr ? remaining / fr : 0

        return parts.map((p) => {
            if (p.endsWith('px')) return parseFloat(p)
            if (p.endsWith('fr')) return parseFloat(p) * frUnit
            return frUnit
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
