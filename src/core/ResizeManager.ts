import { Rect } from './Rect'
import { GutterView } from './view/GutterView'
import type { AreaName, GutterConfig, ResizeHandle } from '../types/ResizeTypes'
import type { AreaTopology, BoundaryGroup } from './AreaTopology'
import type { RectflowContext } from './RectflowContext'
import type { RectOption } from '../types/RectOption'
import type { AreaView } from './view/AreaView'

export class ResizeManager {
    private areaTopology: AreaTopology

    private handles: ResizeHandle[]
    private gutter: GutterConfig
    private layoutGap: number

    private horizontalGutters: GutterView[] = []
    private verticalGutters: GutterView[] = []

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
            this.context.layoutEngine.calculate()

            // 2. Apply new rects to AreaViews
            this.context.areaRenderer.apply()

            // 3. Re-layout gutters (important!)
            this.context.resizeManager?.relayoutGutters()
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

    private createHorizontalGutters() {
        for (const handle of this.handles) {
            const boundary = this.getBoundary(handle, this.areaTopology.horizontalBoundary)
            if (!boundary) continue

            let rectOption = { ...this.computeGutterSpan(boundary, 'x') } as RectOption
            const areaName = boundary.first[0]
            const rect = this.context.layoutEngine.computedRect[areaName]

            rectOption.y = rect.y + rect.height + this.layoutGap / 2 - this.gutter.size / 2
            rectOption.height = this.gutter.size

            const gutterView = new GutterView(
                {
                    config: this.context.options.layout.resize?.gutter as GutterConfig,
                    direction: 'horizontal',
                    boundary,
                },
                new Rect(rectOption),
            )
            this.horizontalGutters.push(gutterView)
            gutterView.mount(this.context.options.container)

            this.attachGutterDrag(gutterView, boundary, {
                getPos: (e) => e.clientY,
                dimension: 'height',
                applyFirst: (view, dy) => {
                    dy > 0 ? view.rect.shrinkFromBottom(dy) : view.rect.growFromBottom(-dy)
                },
                applySecond: (view, dy) => {
                    dy > 0 ? view.rect.growFromTop(dy) : view.rect.shrinkFromTop(-dy)
                },
            })
        }
    }

    private createVerticalGutters() {
        for (const handle of this.handles) {
            const boundary = this.getBoundary(handle, this.areaTopology.verticalBoundary)
            if (!boundary) continue

            let rectOption = { ...this.computeGutterSpan(boundary, 'y') } as RectOption
            const areaName = boundary.first[0]
            const rect = this.context.layoutEngine.computedRect[areaName]
            rectOption.x = rect.x + rect.width + this.layoutGap / 2 - this.gutter.size / 2
            rectOption.width = this.gutter.size

            const gutterView = new GutterView(
                {
                    config: this.context.options.layout.resize?.gutter as GutterConfig,
                    direction: 'vertical',
                    boundary,
                },
                new Rect(rectOption),
            )
            this.verticalGutters.push(gutterView)
            gutterView.mount(this.context.options.container)

            this.attachGutterDrag(gutterView, boundary, {
                getPos: (e) => e.clientX,
                dimension: 'width',
                applyFirst: (view, dx) => {
                    dx > 0 ? view.rect.shrinkFromRight(dx) : view.rect.growFromRight(-dx)
                },
                applySecond: (view, dx) => {
                    dx > 0 ? view.rect.growFromLeft(dx) : view.rect.shrinkFromLeft(-dx)
                },
            })
        }
    }

    private attachGutterDrag(
        gutterView: GutterView,
        boundary: BoundaryGroup,
        config: {
            getPos: (e: MouseEvent) => number
            dimension: 'width' | 'height'
            applyFirst: (view: AreaView, delta: number) => void
            applySecond: (view: AreaView, delta: number) => void
        },
    ) {
        let anchorPos = 0
        let isLocked = false
        let lockedDirection: number | null = null

        let hoverTimer: number | null = null
        let isActive = false

        const clearHoverTimer = () => {
            if (hoverTimer !== null) {
                clearTimeout(hoverTimer)
                hoverTimer = null
            }
        }

        const onMouseMove = (e: MouseEvent) => {
            if (!isActive) return

            const currentPos = config.getPos(e)
            const rawDelta = anchorPos - currentPos
            const direction = Math.sign(rawDelta)

            if (isLocked) {
                if (Math.sign(anchorPos - currentPos) !== lockedDirection) {
                    isLocked = false
                }
                return
            }

            const delta = this.clampResizeDelta(rawDelta, boundary, config.dimension)

            if (delta === 0 && rawDelta !== 0) {
                isLocked = true
                lockedDirection = direction
                return
            }

            if (delta === 0) return

            this.applyResizeToBoundarySide(boundary.first, (view) => config.applyFirst(view, delta))
            this.applyResizeToBoundarySide(boundary.second, (view) => config.applySecond(view, delta))

            anchorPos -= delta

            this.relayoutGutters()
        }

        const onMouseDown = (e: MouseEvent) => {
            e.preventDefault()
            clearHoverTimer()

            this.activeGutter = gutterView

            isActive = true
            isLocked = false
            lockedDirection = null

            gutterView.setState('active')

            anchorPos = config.getPos(e)

            document.addEventListener('mousemove', onMouseMove)
            document.addEventListener('mouseup', onMouseUp)
        }

        const onMouseUp = () => {
            isActive = false
            isLocked = false

            this.activeGutter = null

            gutterView.setState('hover')

            document.removeEventListener('mousemove', onMouseMove)
            document.removeEventListener('mouseup', onMouseUp)
        }

        const onMouseEnter = () => {
            if (this.activeGutter && this.activeGutter !== gutterView) return

            if (isActive) return

            const delay = gutterView.config.delay ?? 0
            clearHoverTimer()

            hoverTimer = window.setTimeout(() => {
                gutterView.setState('hover')
            }, delay)
        }

        const onMouseLeave = () => {
            if (isActive) return
            if (this.activeGutter) return

            clearHoverTimer()
            gutterView.setState('idle')
        }

        const elem = gutterView.elem
        elem.addEventListener('mouseenter', onMouseEnter)
        elem.addEventListener('mouseleave', onMouseLeave)
        elem.addEventListener('mousedown', onMouseDown)
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
            g.rect.y = ref.y + ref.height + this.layoutGap / 2 - this.gutter.size / 2

            g.apply()
        }

        for (const g of this.verticalGutters) {
            const boundary = g.boundary
            const span = this.computeGutterSpan(boundary, 'y') as { y: number; height: number }
            g.rect.y = span.y
            g.rect.height = span.height

            const ref = this.context.areaRenderer.getView(boundary.first[0])!.rect
            g.rect.x = ref.x + ref.width + this.layoutGap / 2 - this.gutter.size / 2

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
