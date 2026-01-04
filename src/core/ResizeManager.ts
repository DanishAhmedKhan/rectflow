import type { ResolvedResizeHandle } from '../types/ResizeTypes'
import type { AreaTopology } from './AreaTopology'

export class ResizeManager {
    private resolvedHandles: ResolvedResizeHandle[] = []

    constructor(private container: HTMLElement, private topology: AreaTopology, private config: ResizeConfig) {}

    init() {
        this.resolvedHandles = this.config.handles.map((handle) => this.topology.resolveHandle(handle))

        this.createGutters()
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

        gutter.style.height = `${gutterSize}px`
        gutter.style.left = '0'
        gutter.style.right = '0'

        this.container.appendChild(gutter)

        const rowIndex = handle.gridLine

        const updatePosition = () => {
            const rowSizes = this.getRowSizes()
            const top = rowSizes.slice(0, rowIndex).reduce((a, b) => a + b, 0)

            gutter.style.top = `${top - gutterSize / 2}px`
        }

        updatePosition()

        let startY = 0
        let startSizes: number[] = []

        const onMouseDown = (e: MouseEvent) => {
            e.preventDefault()
            startY = e.clientY
            startSizes = this.getRowSizes()

            document.addEventListener('mousemove', onMouseMove)
            document.addEventListener('mouseup', onMouseUp)
        }

        const onMouseMove = (e: MouseEvent) => {
            const dy = e.clientY - startY

            const topSize = startSizes[rowIndex - 1] + dy
            const bottomSize = startSizes[rowIndex] - dy

            if (handle.min !== undefined && (topSize < handle.min || bottomSize < handle.min)) return

            const sizes = [...startSizes]
            sizes[rowIndex - 1] = topSize
            sizes[rowIndex] = bottomSize

            this.setRowSizes(sizes)
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

            if (handle.min !== undefined && (leftSize < handle.min || rightSize < handle.min)) return

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
}
