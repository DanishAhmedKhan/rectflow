import type { ComputedLayout, LayoutConfig } from '../types/LayoutConfig'
import { Area } from './Area'

export class LayoutEngine {
    public computedLayout!: ComputedLayout

    constructor(private layout: LayoutConfig, private container: HTMLElement) {
        this.calculate()
        console.log('a', this.computedLayout)
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

        console.log({ rows, cols })

        const rowOffsets = this.accumulate(rows, gap)
        const colOffsets = this.accumulate(cols, gap)
        console.log({ rowOffsets, colOffsets })

        const areas = this.layout.areas
        const result: ComputedLayout = {}

        // for (let r = 0; r < areas.length; r++) {
        //     for (let c = 0; c < areas[r].length; c++) {
        //         const name = areas[r][c]
        //         if (name === '.') continue

        //         if (!result[name]) {
        //             result[name] = new Area({
        //                 name,
        //                 x: colOffsets[c],
        //                 y: rowOffsets[r],
        //                 width: cols[c],
        //                 height: rows[r],
        //             })
        //             if (name === 'C') {
        //                 console.log('heights', rows[r])
        //                 console.log('C', result[name])
        //             }
        //         } else {
        //             const rect = result[name]
        //             if (name === 'C') {
        //                 console.log('modified')
        //             }
        //             if (colOffsets[c] + cols[c] > rect.x + rect.width) {
        //                 rect.width = colOffsets[c] + cols[c] - rect.x
        //             }

        //             if (rowOffsets[r] + rows[r] > rect.y + rect.height) {
        //                 rect.height = rowOffsets[r] + rows[r] - rect.y
        //             }
        //         }
        //     }
        // }

        type AreaSpan = {
            name: string
            rowStart: number
            rowEnd: number
            colStart: number
            colEnd: number
        }

        const spans: Record<string, AreaSpan> = {}

        for (let r = 0; r < areas.length; r++) {
            for (let c = 0; c < areas[r].length; c++) {
                const name = areas[r][c]
                if (name === '.') continue

                if (!spans[name]) {
                    spans[name] = {
                        name,
                        rowStart: r,
                        rowEnd: r,
                        colStart: c,
                        colEnd: c,
                    }
                } else {
                    const span = spans[name]
                    span.rowStart = Math.min(span.rowStart, r)
                    span.rowEnd = Math.max(span.rowEnd, r)
                    span.colStart = Math.min(span.colStart, c)
                    span.colEnd = Math.max(span.colEnd, c)
                }
            }
        }

        console.log('spans', spans)

        for (const name in spans) {
            const span = spans[name]

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

            result[name] = new Area({
                name,
                x,
                y,
                width,
                height,
            })
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

    // private parseTracks(def: string, total: number, gap: number): number[] {
    //     const parts = def.split(/\s+/)

    //     let fixed = 0
    //     let frUnits = 0

    //     for (const p of parts) {
    //         if (p.endsWith('px')) fixed += parseFloat(p)
    //         else if (p.endsWith('fr')) frUnits += parseFloat(p)
    //         else if (p === 'auto') frUnits += 1
    //     }

    //     const gaps = (parts.length - 1) * gap
    //     const remaining = Math.max(0, total - fixed - gaps)
    //     const frUnit = frUnits > 0 ? remaining / frUnits : 0

    //     const sizes = parts.map((p) => {
    //         if (p.endsWith('px')) return parseFloat(p)
    //         if (p.endsWith('fr')) return parseFloat(p) * frUnit
    //         if (p === 'auto') return frUnit
    //         return 0
    //     })

    //     // absorb rounding error (CSS Grid behavior)
    //     const used = sizes.reduce((a, b) => a + b, 0) + gaps
    //     const error = total - used
    //     sizes[sizes.length - 1] += error

    //     return sizes
    // }

    private accumulate(sizes: number[], gap: number): number[] {
        const offsets: number[] = []
        let current = 0
        for (const s of sizes) {
            offsets.push(current)
            current += s + gap
        }
        return offsets

        // const offsets: number[] = []
        // let current = 0

        // for (let i = 0; i < sizes.length; i++) {
        //     offsets.push(current)
        //     current += sizes[i]
        //     if (i < sizes.length - 1) {
        //         current += gap
        //     }
        // }

        // return offsets
    }
}
