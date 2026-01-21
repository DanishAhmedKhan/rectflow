import { Rect } from './Rect'
import { GutterView } from './view/GutterView'
import type { AreaName, GutterConfig, ResizeHandle } from '../types/ResizeTypes'
import type { AreaTopology, BoundaryGroup } from './AreaTopology'
import type { RectflowContext } from './RectflowContext'
import type { RectOption } from '../types/RectOption'

export class ResizeManager {
    private areaTopology: AreaTopology

    private handles!: ResizeHandle[]
    private gutter: GutterConfig
    private layoutGap: number

    private horizontalGutters = new Map<string, GutterView>()
    private verticalGutters = new Map<string, GutterView>()

    private resizeObserver!: ResizeObserver

    constructor(private context: RectflowContext) {
        this.areaTopology = context.areaTopology
        this.gutter = context.options.layout.resize?.gutter! as GutterConfig
        this.layoutGap = context.options.layout.gap ?? 0
        this.initHandles()
    }

    private initHandles() {
        const rawHandles = this.context.options.layout.resize?.handles
        if (!rawHandles) return

        this.handles = rawHandles.map((h) => {
            const [a, b] = h.between

            return {
                between: [a as AreaName, b as AreaName],
                min: h.min,
                max: h.max,
            }
        })
    }

    public apply() {
        if (!this.resizeObserver) this.addContainerResize()

        if (this.handles.length > 0) {
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

            this.createOrUpdateGutterView(this.horizontalGutters, key, rectOption, 'horizontal', boundary)
        }

        this.cleanupInactiveGutters(this.horizontalGutters, activeKeys)
    }

    private createVerticalGutters() {
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

            this.createOrUpdateGutterView(this.verticalGutters, key, rectOption, 'vertical', boundary)
        }

        this.cleanupInactiveGutters(this.verticalGutters, activeKeys)
    }

    private createOrUpdateGutterView(
        gutters: Map<string, GutterView>,
        key: string,
        rectOption: RectOption,
        direction: 'horizontal' | 'vertical',
        boundary: BoundaryGroup,
    ) {
        let gutterView = gutters.get(key)

        if (!gutterView) {
            gutterView = new GutterView(
                {
                    config: this.context.options.layout.resize?.gutter as GutterConfig,
                    direction,
                    boundary,
                },
                new Rect(rectOption),
            )

            gutterView.mount(this.context.options.container)
            gutters.set(key, gutterView)

            this.attachGutterDrag(gutterView, boundary, direction)
        } else {
            gutterView.update(new Rect(rectOption))
        }
    }

    private cleanupInactiveGutters(gutters: Map<string, GutterView>, activeKeys: Set<string>) {
        for (const [key, gutter] of gutters) {
            if (!activeKeys.has(key)) {
                gutter.remove()
                gutters.delete(key)
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
        let isHover = false
        let isActive = false

        let hoverTimer: number | null = null
        let hoverShown = false
        const delay = this.context.options.layout.resize?.gutter?.delay

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

            if (hoverTimer !== null) {
                clearTimeout(hoverTimer)
                hoverTimer = null
            }

            hoverShown = false
            gutterView.setState('active')

            document.addEventListener('mousemove', onMouseMove)
            document.addEventListener('mouseup', onMouseUp)
        }

        const onMouseUp = () => {
            isActive = false

            if (isHover && hoverShown) {
                gutterView.setState('hover')
            } else {
                gutterView.setState('idle')
            }

            document.removeEventListener('mousemove', onMouseMove)
            document.removeEventListener('mouseup', onMouseUp)
        }

        const onMouseEnter = () => {
            isHover = true
            hoverShown = false

            hoverTimer = window.setTimeout(() => {
                if (!isActive && isHover) {
                    gutterView.setState('hover')
                    hoverShown = true
                }
            }, delay)
        }

        const onMouseLeave = () => {
            isHover = false

            if (hoverTimer !== null) {
                clearTimeout(hoverTimer)
                hoverTimer = null
            }

            hoverShown = false

            if (!isActive) {
                gutterView.setState('idle')
            }
        }

        gutterView.elem.addEventListener('mouseenter', onMouseEnter)
        gutterView.elem.addEventListener('mouseleave', onMouseLeave)
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
            const { x, y, width, height } = this.context.layoutEngine.computedRect[name]

            if (axis === 'x') {
                min = Math.min(min, x)
                max = Math.max(max, x + width)
            } else {
                min = Math.min(min, y)
                max = Math.max(max, y + height)
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
