import type { TrackDefinition, TrackUnit } from '../types/TrackTypes'

export class Track {
    readonly unit: TrackUnit
    readonly baseValue: number

    public size: number = 0
    public delta: number = 0

    public min: number = 0
    public max: number = Infinity

    constructor(def: TrackDefinition) {
        this.unit = def.unit
        this.baseValue = def.value
    }

    public effectiveSize() {
        return Math.max(this.min, Math.min(this.size + this.delta, this.max))
    }

    public applyDelta(d: number) {
        this.delta += d
    }
}
