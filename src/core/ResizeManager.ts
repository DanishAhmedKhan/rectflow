import { Rect } from './Rect'
import { GutterView } from './GutterView'
import type { ResizeHandle } from '../types/ResizeTypes'
import type { AreaTopology, BoundaryGroup } from './AreaTopology'
import type { RectflowContext } from './RectflowContext'
import type { RectOption } from '../types/RectOption'

export class ResizeManager {
    private areaTopology: AreaTopology
    private gutterSize: number
    private layoutGap: number

    constructor(private context: RectflowContext) {
        this.areaTopology = context.areaTopology
        this.gutterSize = context.options.layout.resize?.gutter!
        this.layoutGap = context.options.layout.gap ?? 0
    }

    public apply() {
        this.createHorizontalGutters()
        this.createVerticalGutters()
    }

    private computeHorizontalGutterSpan(boundary: BoundaryGroup) {
        const areaNames = boundary.first

        let minX = Infinity
        let maxX = -Infinity

        for (const name of areaNames) {
            const rect = this.context.layoutEngine.computedRect[name]
            minX = Math.min(minX, rect.x)
            maxX = Math.max(maxX, rect.x + rect.width)
        }

        return {
            x: minX,
            width: maxX - minX,
        }
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
        const handles = this.context.options.layout.resize?.handles ?? []

        for (const handle of handles) {
            const boundary = this.getBoundary(handle, this.areaTopology.horizontalBoundary)
            if (!boundary) continue

            let rectOption = { ...this.computeHorizontalGutterSpan(boundary) } as RectOption
            const areaName = handle.between[0]
            const rect = this.context.layoutEngine.computedRect[areaName]
            rectOption.y = rect.y + rect.height + this.layoutGap / 2 - this.gutterSize / 2
            rectOption.height = this.gutterSize

            const gutterView = new GutterView('horizontal', new Rect(rectOption))
            gutterView.style({
                background: 'blue',
                cursor: 'row-resize',
            })
            gutterView.mount(this.context.options.container)

            this.attachHorizontalDrag(gutterView, boundary)
        }
    }

    private attachHorizontalDrag(gutterView: GutterView, boundary: BoundaryGroup) {
        let startY = 0

        const onMouseMove = (e: MouseEvent) => {
            const dy = startY - e.clientY
            startY = e.clientY

            boundary.first.forEach((areaName) => {
                const areView = this.context.areaRenderer.getView(areaName)
                areView?.rect.shrinkFromBottom(dy)
                areView?.apply()
            })

            boundary.second.forEach((areaName) => {
                const areView = this.context.areaRenderer.getView(areaName)
                areView?.rect.growFromTop(dy)
                areView?.apply()
            })

            const rect = this.context.areaRenderer.getView(boundary.first[0])?.rect!
            gutterView.rect.y = rect.y + rect.height + this.layoutGap / 2 - this.gutterSize / 2
            gutterView.apply()
        }

        const onMouseDown = (e: MouseEvent) => {
            e.preventDefault()
            startY = e.clientY

            document.addEventListener('mousemove', onMouseMove)
            document.addEventListener('mouseup', onMouseUp)
        }

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove)
            document.removeEventListener('mouseup', onMouseUp)
        }

        gutterView.elem.addEventListener('mousedown', onMouseDown)
    }

    private computeVerticalGutterSpan(boundary: BoundaryGroup) {
        const areaNames = boundary.first

        let minY = Infinity
        let maxY = -Infinity

        for (const name of areaNames) {
            const rect = this.context.layoutEngine.computedRect[name]
            minY = Math.min(minY, rect.y)
            maxY = Math.max(maxY, rect.y + rect.height)
        }

        return {
            y: minY,
            height: maxY - minY,
        }
    }

    private createVerticalGutters() {
        const handles = this.context.options.layout.resize?.handles ?? []

        for (const handle of handles) {
            const boundary = this.getBoundary(handle, this.areaTopology.verticalBoundary)
            if (!boundary) continue

            console.log(boundary)

            let rectOption = { ...this.computeVerticalGutterSpan(boundary) } as RectOption
            const areaName = handle.between[0]
            const rect = this.context.layoutEngine.computedRect[areaName]
            rectOption.x = rect.x + rect.width + this.layoutGap / 2 - this.gutterSize / 2
            rectOption.width = this.gutterSize

            const gutterView = new GutterView('horizontal', new Rect(rectOption))
            gutterView.style({
                background: 'red',
                cursor: 'col-resize',
            })
            gutterView.mount(this.context.options.container)

            this.attachVerticalDrag(gutterView, boundary)
        }
    }

    private attachVerticalDrag(gutterView: GutterView, boundary: BoundaryGroup) {
        let startX = 0

        const onMouseMove = (e: MouseEvent) => {
            const dx = startX - e.clientX
            startX = e.clientX

            boundary.first.forEach((areaName) => {
                const areView = this.context.areaRenderer.getView(areaName)
                areView?.rect.shrinkFromRight(dx)
                areView?.apply()
            })

            boundary.second.forEach((areaName) => {
                const areView = this.context.areaRenderer.getView(areaName)
                areView?.rect.growFromLeft(dx)
                areView?.apply()
            })

            const rect = this.context.areaRenderer.getView(boundary.first[0])?.rect!
            gutterView.rect.x = rect.x + rect.width + this.layoutGap / 2 - this.gutterSize / 2
            gutterView.apply()
        }

        const onMouseDown = (e: MouseEvent) => {
            e.preventDefault()
            startX = e.clientX

            document.addEventListener('mousemove', onMouseMove)
            document.addEventListener('mouseup', onMouseUp)
        }

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove)
            document.removeEventListener('mouseup', onMouseUp)
        }

        gutterView.elem.addEventListener('mousedown', onMouseDown)
    }
}
