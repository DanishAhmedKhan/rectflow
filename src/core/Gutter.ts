import type { AreaName } from '../types/ResizeTypes'
import type { Area } from './AreaView'
import type { BoundaryGroup } from './AreaTopology'

export class Gutter {
    private elem: HTMLElement
    private snapshot = new Map<AreaName, Area>()
    private startPos = 0

    constructor(
        private container: HTMLElement,
        private areas: Map<AreaName, Area>,
        private boundary: BoundaryGroup,
        private direction: 'horizontal' | 'vertical',
        private gutterSize: number,
        private onUpdate: () => void,
    ) {
        this.elem = document.createElement('div')
        this.elem.className = `rf-gutter rf-gutter-${direction}`

        this.initStyle()
        this.attachDrag()
        this.container.appendChild(this.elem)
    }

    private initStyle() {
        Object.assign(this.elem.style, {
            position: 'absolute',
            cursor: this.direction === 'horizontal' ? 'row-resize' : 'col-resize',
        })
    }

    public setRect(rect: { x: number; y: number; width: number; height: number }) {
        Object.assign(this.elem.style, {
            left: `${rect.x}px`,
            top: `${rect.y}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`,
        })
    }

    private attachDrag() {
        const onMouseMove = (e: MouseEvent) => {
            const delta = this.direction === 'horizontal' ? e.clientY - this.startPos : e.clientX - this.startPos

            this.applyResize(delta)
            this.onUpdate()
        }

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove)
            document.removeEventListener('mouseup', onMouseUp)
        }

        const onMouseDown = (e: MouseEvent) => {
            e.preventDefault()
            this.startPos = this.direction === 'horizontal' ? e.clientY : e.clientX

            this.snapshot.clear()
            for (const n of [...this.boundary.first, ...this.boundary.second]) {
                this.snapshot.set(n, this.areas.get(n)!.clone())
            }

            document.addEventListener('mousemove', onMouseMove)
            document.addEventListener('mouseup', onMouseUp)
        }

        this.elem.addEventListener('mousedown', onMouseDown)
    }

    private applyResize(delta: number) {
        if (this.direction === 'horizontal') {
            this.resizeHorizontal(delta)
        } else {
            this.resizeVertical(delta)
        }
    }

    private resizeHorizontal(dy: number) {
        // above
        for (const name of this.boundary.first) {
            const area = this.areas.get(name)!
            const base = this.snapshot.get(name)!
            area.y = base.y
            area.height = base.height
            area.growFromBottom(dy)
        }

        // below
        for (const name of this.boundary.second) {
            const area = this.areas.get(name)!
            const base = this.snapshot.get(name)!
            area.y = base.y
            area.height = base.height
            area.shrinkFromTop(dy)
        }
    }

    private resizeVertical(dx: number) {
        // left
        for (const name of this.boundary.first) {
            const area = this.areas.get(name)!
            const base = this.snapshot.get(name)!
            area.x = base.x
            area.width = base.width
            area.growFromBottom(dx) // width grow
        }

        // right
        for (const name of this.boundary.second) {
            const area = this.areas.get(name)!
            const base = this.snapshot.get(name)!
            area.x = base.x
            area.width = base.width
            area.shrinkFromTop(dx)
        }
    }
}
