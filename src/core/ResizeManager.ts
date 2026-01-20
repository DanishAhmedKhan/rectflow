import { Rect } from './Rect'
import { AreaView } from './view/AreaView'
import { GutterView } from './view/GutterView'
import type { AreaName, GutterConfig, ResizeHandle } from '../types/ResizeTypes'
import type { AreaTopology, BoundaryGroup } from './AreaTopology'
import type { RectflowContext } from './RectflowContext'
import type { RectOption } from '../types/RectOption'

export class ResizeManager {
    private areaTopology: AreaTopology

    private handles: ResizeHandle[]
    private gutter: GutterConfig
    private layoutGap: number

    private horizontalGutters = new Map<string, GutterView>()
    private verticalGutters = new Map<string, GutterView>()

    private resizeObserver!: ResizeObserver
    private activeGutter: GutterView | null = null

    constructor(private context: RectflowContext) {
        this.areaTopology = context.areaTopology
        this.gutter = context.options.layout.resize?.gutter! as GutterConfig
        this.layoutGap = context.options.layout.gap ?? 0
        this.handles = this.context.options.layout.resize?.handles ?? []
    }

    public apply() {
        if (!this.resizeObserver) this.addContainerResize()

        if (this.context.options.layout.resize && this.context.options.layout.resize.handles.length > 0) {
            this.createHorizontalGutters()
            this.createVerticalGutters()
        }
    }

    private addContainerResize() {
        const container = this.context.options.container
        this.resizeObserver = new ResizeObserver(() => {
            this.context.onLayoutChange?.()
        })

        this.resizeObserver.observe(container)
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

    private getBoundaryKey(boundary: BoundaryGroup): string {
        return boundary.first.join('|') + '::' + boundary.second.join('|')
    }

    private createHorizontalGutters() {
        const container = this.context.options.container
        const computedRect = this.context.layoutEngine.computedRect

        const activeKeys = new Set<string>()

        for (const handle of this.handles) {
            const boundary = this.getBoundary(handle, this.areaTopology.horizontalBoundary)
            if (!boundary) continue

            const key = this.getBoundaryKey(boundary)
            activeKeys.add(key)

            let rectOption = { ...this.computeGutterSpan(boundary, 'x') } as RectOption
            const areaName = boundary.first[0]
            const rect = computedRect[areaName]

            rectOption.y = rect.y + rect.height + this.layoutGap / 2 - this.gutter.size / 2
            rectOption.height = this.gutter.size

            let gutterView = this.horizontalGutters.get(key)

            if (!gutterView) {
                gutterView = new GutterView(
                    {
                        config: this.context.options.layout.resize?.gutter as GutterConfig,
                        direction: 'horizontal',
                        boundary,
                    },
                    new Rect(rectOption),
                )

                gutterView.mount(container)
                this.horizontalGutters.set(key, gutterView)

                this.attachGutterDrag(gutterView, boundary, 'horizontal')
            } else {
                gutterView.update(new Rect(rectOption))
            }
        }

        for (const [key, gutter] of this.horizontalGutters) {
            if (!activeKeys.has(key)) {
                gutter.remove()
                this.horizontalGutters.delete(key)
            }
        }
    }

    private createVerticalGutters() {
        const container = this.context.options.container
        const computedRect = this.context.layoutEngine.computedRect

        const activeKeys = new Set<string>()

        for (const handle of this.handles) {
            const boundary = this.getBoundary(handle, this.areaTopology.verticalBoundary)
            if (!boundary) continue

            const key = this.getBoundaryKey(boundary)
            activeKeys.add(key)

            let rectOption = { ...this.computeGutterSpan(boundary, 'y') } as RectOption
            const areaName = boundary.first[0]
            const rect = computedRect[areaName]

            rectOption.x = rect.x + rect.width + this.layoutGap / 2 - this.gutter.size / 2
            rectOption.width = this.gutter.size

            let gutterView = this.verticalGutters.get(key)

            if (!gutterView) {
                gutterView = new GutterView(
                    {
                        config: this.context.options.layout.resize?.gutter as GutterConfig,
                        direction: 'vertical',
                        boundary,
                    },
                    new Rect(rectOption),
                )

                gutterView.mount(container)
                this.verticalGutters.set(key, gutterView)

                this.attachGutterDrag(gutterView, boundary, 'vertical')
            } else {
                gutterView.update(new Rect(rectOption))
            }
        }

        for (const [key, gutter] of this.verticalGutters) {
            if (!activeKeys.has(key)) {
                gutter.remove()
                this.verticalGutters.delete(key)
            }
        }
    }

    private getRowIndexFromBoundary(boundary: BoundaryGroup): number {
        const area = boundary.first[0]
        const box = this.context.areaTopology.boxes[area]
        return box.rowEnd
    }

    private getColIndexFromBoundary(boundary: BoundaryGroup): number {
        const area = boundary.first[0]
        const box = this.context.areaTopology.boxes[area]
        return box.colEnd
    }

    private attachGutterDrag(gutterView: GutterView, boundary: BoundaryGroup, direction: 'horizontal' | 'vertical') {
        let anchorPos = 0
        let isActive = false

        const getPos = (e: MouseEvent) => (direction === 'horizontal' ? e.clientY : e.clientX)

        const onMouseMove = (e: MouseEvent) => {
            if (!isActive) return

            const current = getPos(e)
            const rawDelta = current - anchorPos
            if (rawDelta === 0) return

            let appliedDelta = 0

            if (direction === 'horizontal') {
                const rowIndex = this.getRowIndexFromBoundary(boundary)
                appliedDelta = this.context.layoutEngine.resizeRow(rowIndex, rawDelta)
            } else {
                const colIndex = this.getColIndexFromBoundary(boundary)
                appliedDelta = this.context.layoutEngine.resizeColumn(colIndex, rawDelta)
            }

            if (appliedDelta !== 0) {
                anchorPos += appliedDelta
                this.context.onLayoutChange?.()
            }
        }

        const onMouseDown = (e: MouseEvent) => {
            e.preventDefault()
            isActive = true
            anchorPos = getPos(e)

            gutterView.setState('active')

            document.addEventListener('mousemove', onMouseMove)
            document.addEventListener('mouseup', onMouseUp)
        }

        const onMouseUp = () => {
            isActive = false
            gutterView.setState('hover')

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

    public relayoutGutters() {
        for (const gutter of this.horizontalGutters.values()) {
            const boundary = gutter.boundary

            const span = this.computeGutterSpan(boundary, 'x') as {
                x: number
                width: number
            }

            gutter.rect.x = span.x
            gutter.rect.width = span.width

            const refRect = this.context.areaRenderer.getView(boundary.first[0])!.rect
            gutter.rect.y = refRect.y + refRect.height + this.layoutGap / 2 - this.gutter.size / 2

            gutter.applyRect()
        }

        for (const gutter of this.verticalGutters.values()) {
            const boundary = gutter.boundary

            const span = this.computeGutterSpan(boundary, 'y') as {
                y: number
                height: number
            }

            gutter.rect.y = span.y
            gutter.rect.height = span.height

            const refRect = this.context.areaRenderer.getView(boundary.first[0])!.rect
            gutter.rect.x = refRect.x + refRect.width + this.layoutGap / 2 - this.gutter.size / 2

            gutter.applyRect()
        }
    }
}
