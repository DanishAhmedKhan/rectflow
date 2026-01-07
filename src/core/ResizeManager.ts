import type { Rect } from '../types/LayoutConfig'
import type { ResizeConfig, ResolvedResizeHandle } from '../types/ResizeTypes'
import type { AreaTopology } from './AreaTopology'
import type { RectflowContext } from './RectflowContext'

export class ResizeManager {
    private areaTopology: AreaTopology
    private container: HTMLElement
    private config: ResizeConfig
    private resolvedHandles: ResolvedResizeHandle[] = []

    constructor(private context: RectflowContext) {
        this.areaTopology = context.areaTopology
        this.container = context.options.container
        this.config = context.options.layout.resize!

        this.init()
    }

    private init() {
        this.resolvedHandles = this.config?.handles.map((handle) => {
            return this.areaTopology.resolveHandle(handle)
        })

        if (this.resolvedHandles) this.createGutters()
    }

    private createGutters() {
        for (const rh of this.resolvedHandles) {
            if (rh.direction === 'vertical') {
                this.createVerticalGutter(rh)
            } else {
                this.createHorizontalGutter(rh)
            }
        }
    }

    private createHorizontalGutter(handle: ResolvedResizeHandle) {
        const gutter = document.createElement('div')
        gutter.className = 'rf-gutter horizontal'

        const gutterSize = this.config.gutter ?? 6

        gutter.style.position = 'absolute'
        gutter.style.height = `${gutterSize}px`
        gutter.style.left = '0'
        gutter.style.right = '0'

        this.container.appendChild(gutter)

        const [aName, bName] = handle.handle.between
        // console.log('asdas', this.context.computedLayout)

        const a = this.context.computedLayout[aName]
        const b = this.context.computedLayout[bName]

        const topArea = a.y <= b.y ? a : b
        const bottomArea = topArea === a ? b : a

        const updatePosition = () => {
            const layout = this.context.computedLayout
            if (!layout) return

            const gap = this.context.options.layout.gap ?? 0
            const rect = layout[topArea.name]
            const top = rect.y + rect.height + gap / 2 - gutterSize / 2

            gutter.style.top = `${top}px`
        }

        updatePosition()

        let startY = 0
        let startTopRect: Rect
        let startBottomRect: Rect

        const onMouseDown = (e: MouseEvent) => {
            e.preventDefault()
            startY = e.clientY

            startTopRect = { ...this.context.computedLayout[topArea.name] }
            startBottomRect = { ...this.context.computedLayout[bottomArea.name] }

            document.addEventListener('mousemove', onMouseMove)
            document.addEventListener('mouseup', onMouseUp)
        }

        const onMouseMove = (e: MouseEvent) => {
            if (!this.context.computedLayout) return

            const dy = e.clientY - startY

            const newTopHeight = startTopRect.height + dy
            const newBottomHeight = startBottomRect.height - dy

            if (newTopHeight <= 0 || newBottomHeight <= 0) return

            this.context.computedLayout[topArea.name] = {
                ...startTopRect,
                height: startTopRect.height + dy,
                // height: newTopHeight,
            }

            this.context.computedLayout[bottomArea.name] = {
                ...startBottomRect,
                y: startBottomRect.y + dy,
                height: startBottomRect.height - dy,
                // y: startTopRect.y + newTopHeight + 16, // ✅ GAP PRESERVED
                // height: newBottomHeight,
            }

            this.context.onLayoutChange?.()
            updatePosition()
        }

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove)
            document.removeEventListener('mouseup', onMouseUp)
        }

        gutter.addEventListener('mousedown', onMouseDown)
    }

    private createVerticalGutter(handle: ResolvedResizeHandle) {
        const gutter = document.createElement('div')
        gutter.className = 'rf-gutter vertical'

        const gutterSize = this.config.gutter ?? 6

        gutter.style.position = 'absolute'
        gutter.style.width = `${gutterSize}px`
        gutter.style.top = '0'
        gutter.style.bottom = '0'

        this.container.appendChild(gutter)

        const colIndex = handle.gridLine

        const updatePosition = () => {
            const colSizes = this.getColumnSizes()
            const left = colSizes.slice(0, colIndex).reduce((a, b) => a + b, 0)

            gutter.style.left = `${left - gutterSize / 2}px`
        }

        updatePosition()

        let startX = 0
        let startSizes: number[] = []

        const onMouseDown = (e: MouseEvent) => {
            e.preventDefault()
            startX = e.clientX
            startSizes = this.getColumnSizes()

            document.addEventListener('mousemove', onMouseMove)
            document.addEventListener('mouseup', onMouseUp)
        }

        const onMouseMove = (e: MouseEvent) => {
            const dx = e.clientX - startX

            const leftSize = startSizes[colIndex - 1] + dx
            const rightSize = startSizes[colIndex] - dx

            // if (handle.min !== undefined && (leftSize < handle.min || rightSize < handle.min)) return

            const sizes = [...startSizes]
            sizes[colIndex - 1] = leftSize
            sizes[colIndex] = rightSize

            this.setColumnSizes(sizes)
            updatePosition()
        }

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove)
            document.removeEventListener('mouseup', onMouseUp)
        }

        gutter.addEventListener('mousedown', onMouseDown)
    }

    private getColumnSizes(): number[] {
        const cols = getComputedStyle(this.container)
            .gridTemplateColumns.split(' ')
            .map((v) => parseFloat(v))

        return cols
    }

    private getRowSizes(): number[] {
        const rows = getComputedStyle(this.container)
            .gridTemplateRows.split(' ')
            .map((v) => parseFloat(v))

        return rows
    }

    private setColumnSizes(sizes: number[]) {
        this.container.style.gridTemplateColumns = sizes.map((v) => `${v}px`).join(' ')
    }

    private setRowSizes(sizes: number[]) {
        this.container.style.gridTemplateRows = sizes.map((v) => `${v}px`).join(' ')
    }
}
