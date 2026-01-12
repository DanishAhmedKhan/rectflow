import { Rect } from './Rect'
import { GutterView } from './GutterView'
import type { AreaName, ResizeHandle } from '../types/ResizeTypes'
import type { AreaTopology, BoundaryGroup } from './AreaTopology'
import type { RectflowContext } from './RectflowContext'
import type { RectOption } from '../types/RectOption'
import type { AreaView } from './AreaView'

export class ResizeManager {
    private areaTopology: AreaTopology

    private handles: ResizeHandle[]
    private gutterSize: number
    private layoutGap: number

    private horizontalGutters: GutterView[] = []
    private verticalGutters: GutterView[] = []

    constructor(private context: RectflowContext) {
        this.areaTopology = context.areaTopology
        this.gutterSize = context.options.layout.resize?.gutter!
        this.layoutGap = context.options.layout.gap ?? 0
        this.handles = this.context.options.layout.resize?.handles ?? []
    }

    public apply() {
        this.createHorizontalGutters()
        this.createVerticalGutters()
    }

    private getBoundary(handle: ResizeHandle, boundaries: BoundaryGroup[]): BoundaryGroup | undefined {
        const [a, b] = handle.between

        for (const boundary of boundaries) {
            if (
                (boundary.first.includes(a) && boundary.second.includes(b)) ||
                (boundary.first.includes(b) && boundary.second.includes(a))
            )
                return boundary
        }
    }

    private createHorizontalGutters() {
        for (const handle of this.handles) {
            const boundary = this.getBoundary(handle, this.areaTopology.horizontalBoundary)
            if (!boundary) continue

            let rectOption = { ...this.computeGutterSpan(boundary, 'x') } as RectOption
            const areaName = boundary.first[0]
            const rect = this.context.layoutEngine.computedRect[areaName]

            rectOption.y = rect.y + rect.height + this.layoutGap / 2 - this.gutterSize / 2
            rectOption.height = this.gutterSize

            const gutterView = new GutterView('horizontal', boundary, new Rect(rectOption))
            this.horizontalGutters.push(gutterView)
            gutterView.style({
                background: 'blue',
                cursor: 'row-resize',
            })
            gutterView.mount(this.context.options.container)

            this.attachHorizontalDrag(gutterView, boundary)
        }
    }

    private attachHorizontalDrag(gutterView: GutterView, boundary: BoundaryGroup) {
        let lastY = 0

        const onMouseMove = (e: MouseEvent) => {
            let dy = this.clampResizeDelta(lastY - e.clientY, boundary, 'height')
            lastY = e.clientY

            this.applyResizeToBoundarySide(boundary.first, (view) => {
                dy > 0 ? view.rect.shrinkFromBottom(dy) : view.rect.growFromBottom(-dy)
            })

            this.applyResizeToBoundarySide(boundary.second, (view) => {
                dy > 0 ? view.rect.growFromTop(dy) : view.rect.shrinkFromTop(-dy)
            })

            this.relayoutGutters()
        }

        const onMouseDown = (e: MouseEvent) => {
            e.preventDefault()
            lastY = e.clientY

            document.addEventListener('mousemove', onMouseMove)
            document.addEventListener('mouseup', onMouseUp)
        }

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove)
            document.removeEventListener('mouseup', onMouseUp)
        }

        gutterView.elem.addEventListener('mousedown', onMouseDown)
    }

    private createVerticalGutters() {
        for (const handle of this.handles) {
            const boundary = this.getBoundary(handle, this.areaTopology.verticalBoundary)
            if (!boundary) continue

            let rectOption = { ...this.computeGutterSpan(boundary, 'y') } as RectOption
            const areaName = boundary.first[0]
            const rect = this.context.layoutEngine.computedRect[areaName]
            rectOption.x = rect.x + rect.width + this.layoutGap / 2 - this.gutterSize / 2
            rectOption.width = this.gutterSize

            const gutterView = new GutterView('horizontal', boundary, new Rect(rectOption))
            this.verticalGutters.push(gutterView)
            gutterView.style({
                background: 'red',
                cursor: 'col-resize',
            })
            gutterView.mount(this.context.options.container)

            this.attachVerticalDrag(gutterView, boundary)
        }
    }

    private attachVerticalDrag(gutterView: GutterView, boundary: BoundaryGroup) {
        let lastX = 0

        const onMouseMove = (e: MouseEvent) => {
            let dx = this.clampResizeDelta(lastX - e.clientX, boundary, 'width')
            lastX = e.clientX

            this.applyResizeToBoundarySide(boundary.first, (view) => {
                dx > 0 ? view.rect.shrinkFromRight(dx) : view.rect.growFromRight(-dx)
            })

            this.applyResizeToBoundarySide(boundary.second, (view) => {
                dx > 0 ? view.rect.growFromLeft(dx) : view.rect.shrinkFromLeft(-dx)
            })

            this.relayoutGutters()
        }

        const onMouseDown = (e: MouseEvent) => {
            e.preventDefault()
            lastX = e.clientX

            document.addEventListener('mousemove', onMouseMove)
            document.addEventListener('mouseup', onMouseUp)
        }

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove)
            document.removeEventListener('mouseup', onMouseUp)
        }

        gutterView.elem.addEventListener('mousedown', onMouseDown)
    }

    private computeGutterSpan(
        boundary: BoundaryGroup,
        axis: 'x' | 'y',
    ): { x: number; width: number } | { y: number; height: number } {
        const areaNames = boundary.first

        let min = Infinity
        let max = -Infinity

        for (const name of areaNames) {
            const rect = this.context.layoutEngine.computedRect[name]

            if (axis === 'x') {
                min = Math.min(min, rect.x)
                max = Math.max(max, rect.x + rect.width)
            } else {
                min = Math.min(min, rect.y)
                max = Math.max(max, rect.y + rect.height)
            }
        }

        return axis === 'x' ? { x: min, width: max - min } : { y: min, height: max - min }
    }

    private relayoutGutters() {
        for (const g of this.horizontalGutters) {
            const boundary = g.boundary
            const span = this.computeGutterSpan(boundary, 'x') as { x: number; width: number }
            g.rect.x = span.x
            g.rect.width = span.width

            const ref = this.context.areaRenderer.getView(boundary.first[0])!.rect
            g.rect.y = ref.y + ref.height + this.layoutGap / 2 - this.gutterSize / 2

            g.apply()
        }

        for (const g of this.verticalGutters) {
            const boundary = g.boundary
            const span = this.computeGutterSpan(boundary, 'y') as { y: number; height: number }
            g.rect.y = span.y
            g.rect.height = span.height

            const ref = this.context.areaRenderer.getView(boundary.first[0])!.rect
            g.rect.x = ref.x + ref.width + this.layoutGap / 2 - this.gutterSize / 2

            g.apply()
        }
    }

    public clampResizeDelta(delta: number, boundary: BoundaryGroup, dimension: 'width' | 'height'): number {
        if (delta > 0) {
            for (const name of boundary.first) {
                const v = this.context.areaRenderer.getView(name)!
                delta = Math.min(delta, v.rect[dimension])
            }
        } else if (delta < 0) {
            for (const name of boundary.second) {
                const v = this.context.areaRenderer.getView(name)!
                delta = Math.max(delta, -v.rect[dimension])
            }
        }
        return delta
    }

    private applyResizeToBoundarySide(boundarySide: AreaName[], resize: (view: AreaView) => void) {
        boundarySide.forEach((name) => {
            const view = this.context.areaRenderer.getView(name)!
            resize(view)
            view.apply()
        })
    }
}
