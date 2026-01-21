import { Rect } from './Rect'
import { Track } from './Track'
import type { RectflowContext } from './RectflowContext'
import type { ComputedRect } from '../types/LayoutConfig'

export class LayoutEngine {
    public computedRect: ComputedRect = {}

    private rowTracks: Track[] = []
    private colTracks: Track[] = []

    private tracksBuilt = false
    private tracksResolved = false

    constructor(private context: RectflowContext) {}

    // public setLayout(layout: LayoutConfig) {
    //     this.context.options
    //     this.context.options.layout = layout

    //     this.tracksBuilt = false
    //     this.tracksResolved = false

    //     this.calculate()
    // }

    public calculate() {
        this.initTracks()

        this.computedRect = {}

        const container = this.context.options.container
        const layout = this.context.options.layout
        const boxes = this.context.areaTopology.boxes
        const gap = layout.gap ?? 0

        if (!this.tracksResolved) {
            this.resolveTracks(this.rowTracks, container.clientHeight, gap)
            this.resolveTracks(this.colTracks, container.clientWidth, gap)
            this.tracksResolved = true
        } else {
            this.scaleTracks(this.rowTracks, container.clientHeight, gap)
            this.scaleTracks(this.colTracks, container.clientWidth, gap)
        }

        const rowOffsets = this.accumulateTracks(this.rowTracks, gap)
        const colOffsets = this.accumulateTracks(this.colTracks, gap)

        for (const name in boxes) {
            const span = boxes[name]

            const x = colOffsets[span.colStart]
            const y = rowOffsets[span.rowStart]

            let width = 0
            for (let c = span.colStart; c <= span.colEnd; c++) {
                width += this.colTracks[c].effectiveSize()
                if (c < span.colEnd) width += gap
            }

            let height = 0
            for (let r = span.rowStart; r <= span.rowEnd; r++) {
                height += this.rowTracks[r].effectiveSize()
                if (r < span.rowEnd) height += gap
            }

            this.computedRect[name] = new Rect({ x, y, width, height })
        }
    }

    public initTracks() {
        if (this.tracksBuilt) return

        const layout = this.context.options.layout
        this.rowTracks = this.buildTracks(layout.rows)
        this.colTracks = this.buildTracks(layout.columns)

        this.tracksBuilt = true
        this.tracksResolved = false
    }

    private buildTracks(def: string): Track[] {
        return def.split(/\s+/).map((p) => {
            if (p.endsWith('px')) return new Track('px', parseFloat(p))
            if (p.endsWith('fr')) return new Track('fr', parseFloat(p))
            if (p === 'auto') return new Track('auto', 1)
            throw new Error(`Invalid track: ${p}`)
        })
    }

    private resolveTracks(tracks: Track[], total: number, gap: number) {
        const gapTotal = gap * (tracks.length - 1)
        const available = total - gapTotal

        let fixed = 0
        let frTotal = 0

        for (const t of tracks) {
            if (t.unit === 'px') fixed += t.baseValue
            else if (t.unit === 'fr') frTotal += t.baseValue
            else if (t.unit === 'auto') frTotal += 1
        }

        const remaining = Math.max(0, available - fixed)
        const frUnit = frTotal > 0 ? remaining / frTotal : 0

        for (const t of tracks) {
            if (t.size !== 0) continue

            if (t.unit === 'px') t.size = t.baseValue
            else if (t.unit === 'fr') t.size = t.baseValue * frUnit
            else if (t.unit === 'auto') t.size = frUnit
        }
    }

    private accumulateTracks(tracks: Track[], gap: number): number[] {
        const offsets: number[] = []
        let current = 0

        for (const t of tracks) {
            offsets.push(current)
            current += t.effectiveSize() + gap
        }

        return offsets
    }

    private scaleTracks(tracks: Track[], total: number, gap: number) {
        const gapTotal = gap * (tracks.length - 1)
        const available = total - gapTotal

        const fixedSize = tracks.filter((t) => t.unit === 'px').reduce((s, t) => s + t.effectiveSize(), 0)

        const flexTracks = tracks.filter((t) => t.unit !== 'px')
        const currentFlexSize = flexTracks.reduce((s, t) => s + t.effectiveSize(), 0)

        if (currentFlexSize === 0) return

        const remaining = Math.max(0, available - fixedSize)
        const scale = remaining / currentFlexSize

        for (const t of flexTracks) {
            t.size *= scale
            t.delta *= scale
        }
    }

    public resizeRow(index: number, delta: number): number {
        const a = this.rowTracks[index]
        const b = this.rowTracks[index + 1]
        if (!a || !b) return 0

        const da = a.clampDelta(delta)
        const db = -b.clampDelta(-delta)

        const applied = Math.abs(da) < Math.abs(db) ? da : db
        if (applied === 0) return 0

        a.applyDelta(applied)
        b.applyDelta(-applied)

        return applied
    }

    public resizeColumn(index: number, delta: number): number {
        const a = this.colTracks[index]
        const b = this.colTracks[index + 1]
        if (!a || !b) return 0

        const da = a.clampDelta(delta)
        const db = -b.clampDelta(-delta)

        const applied = Math.abs(da) < Math.abs(db) ? da : db
        if (applied === 0) return 0

        a.applyDelta(applied)
        b.applyDelta(-applied)

        return applied
    }
}
