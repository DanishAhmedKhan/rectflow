import type { RectOption } from '../types/RectOption'
import { Rect } from './Rect'

export class RectView {
    public elem: HTMLElement
    public rect: Rect

    constructor(rect: Rect | RectOption) {
        this.elem = document.createElement('div')
        if (rect instanceof Rect) this.rect = rect
        else this.rect = new Rect(rect)

        this.elem.style.position = 'absolute'

        this.apply()
    }

    public apply() {
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
        container.append(this.elem)
    }

    public remove() {
        this.elem.remove()
    }
}
