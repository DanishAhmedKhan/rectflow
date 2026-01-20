import type { RectOption } from '../../types/RectOption'
import { Rect } from '../Rect'

export class RectView {
    public elem: HTMLElement
    public rect: Rect

    constructor(rect: Rect | RectOption) {
        this.elem = document.createElement('div')
        this.elem.style.position = 'absolute'

        if (rect instanceof Rect) this.rect = rect
        else this.rect = new Rect(rect)

        this.applyRect()
    }

    public update(rect: Rect | RectOption) {
        if (rect instanceof Rect) this.rect = rect
        else this.rect = new Rect(rect)
        this.applyRect()
    }

    public applyRect() {
        this.style({
            left: `${this.rect.x}px`,
            top: `${this.rect.y}px`,
            width: `${this.rect.width}px`,
            height: `${this.rect.height}px`,
        })
    }

    public style(styles: Record<string, string>) {
        Object.assign(this.elem.style, styles)
    }

    public mount(container: HTMLElement) {
        if (!this.elem.parentElement) {
            container.appendChild(this.elem)
        }
    }

    public remove() {
        this.elem.remove()
    }
}
