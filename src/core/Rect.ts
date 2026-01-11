import type { RectOption } from '../types/RectOption'

export class Rect {
    public x: number
    public y: number
    public width: number
    public height: number

    constructor(rect: RectOption) {
        this.x = rect.x
        this.y = rect.y
        this.width = rect.width
        this.height = rect.height
    }

    public moveX(dx: number) {
        this.x += dx
    }

    public resizeWidth(dw: number) {
        this.width += dw
    }

    public growFromLeft(delta: number) {
        this.x -= delta
        this.width += delta
    }

    public shrinkFromLeft(delta: number) {
        this.x += delta
        this.width -= delta
    }

    public growFromRight(delta: number) {
        this.width += delta
    }

    public shrinkFromRight(delta: number) {
        this.width -= delta
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
        return new Rect({
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
        })
    }
}
