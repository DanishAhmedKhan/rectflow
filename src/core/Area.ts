import type { Rect } from '../types/LayoutConfig'

type AreaName = string

export class Area {
    readonly name: AreaName
    public x: number
    public y: number
    public width: number
    public height: number

    constructor(rect: Rect) {
        this.name = rect.name
        this.x = rect.x
        this.y = rect.y
        this.width = rect.width
        this.height = rect.height
    }

    public moveY(dy: number) {
        this.y += dy
    }

    public resizeHeight(dh: number) {
        this.height += dh
    }

    public growFromTop(delta: number) {
        this.y -= delta
        this.height += delta
    }

    public shrinkFromTop(delta: number) {
        this.y += delta
        this.height -= delta
    }

    public growFromBottom(delta: number) {
        this.height += delta
    }

    public shrinkFromBottom(delta: number) {
        this.height -= delta
    }

    public clone() {
        return new Area({
            name: this.name,
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
        })
    }
}
