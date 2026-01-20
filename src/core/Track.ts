import type { TrackUnit } from '../types/TrackTypes'

export class Track {
    readonly unit: TrackUnit
    readonly baseValue: number

    public size = 0
    public delta = 0

    public min = 0
    public max = Infinity

    constructor(unit: TrackUnit, value: number) {
        this.unit = unit
        this.baseValue = value
    }

    public effectiveSize() {
        return Math.max(this.min, Math.min(this.size + this.delta, this.max))
    }

    public clampDelta(delta: number): number {
        const current = this.effectiveSize()

        if (delta > 0) {
            return Math.min(delta, this.max - current)
        }
        return Math.max(delta, this.min - current)
    }

    public applyDelta(delta: number) {
        this.delta += delta
    }
}
