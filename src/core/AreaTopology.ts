import type { LayoutAreas } from '../types/LayoutConfig'
import type { ResizeHandle, ResolvedResizeHandle } from '../types/ResizeTypes'

export type Cell = {
    area: AreaName
    row: number
    col: number
}

export type AreaBox = {
    area: AreaName
    rowStart: number
    rowEnd: number
    colStart: number
    colEnd: number
}

type AreaName = string

type BoundaryGroup = {
    first: AreaName[]
    second: AreaName[]
}

export class AreaTopology {
    public cells: Cell[] = []
    public boxes: Record<AreaName, AreaBox> = {}
    public horizontalBoundary!: BoundaryGroup[]
    public verticalBoundary!: BoundaryGroup[]

    constructor(private layoutAreas: LayoutAreas) {
        this.buildCells()
        this.calculateBoxes()
        this.computeHorizontalBoundaries(Object.values(this.boxes))
        this.computeVerticalBoundaries(Object.values(this.boxes))
    }

    private buildCells() {
        this.cells = []

        for (let r = 0; r < this.layoutAreas.length; r++) {
            for (let c = 0; c < this.layoutAreas[r].length; c++) {
                this.cells.push({
                    area: this.layoutAreas[r][c],
                    row: r,
                    col: c,
                })
            }
        }
    }

    private calculateBoxes() {
        for (const cell of this.cells) {
            if (!this.boxes[cell.area]) {
                this.boxes[cell.area] = {
                    area: cell.area,
                    rowStart: cell.row,
                    rowEnd: cell.row,
                    colStart: cell.col,
                    colEnd: cell.col,
                }
            } else {
                const box = this.boxes[cell.area]
                box.rowStart = Math.min(box.rowStart, cell.row)
                box.rowEnd = Math.max(box.rowEnd, cell.row)
                box.colStart = Math.min(box.colStart, cell.col)
                box.colEnd = Math.max(box.colEnd, cell.col)
            }
        }
    }

    private isVerticalNeighbor(a: AreaBox, b: AreaBox): boolean {
        return (
            (a.colEnd + 1 === b.colStart || b.colEnd + 1 === a.colStart) &&
            !(a.rowEnd < b.rowStart || b.rowEnd < a.rowStart)
        )
    }

    private isHorizontalNeighbor(a: AreaBox, b: AreaBox): boolean {
        return (
            (a.rowEnd + 1 === b.rowStart || b.rowEnd + 1 === a.rowStart) &&
            !(a.colEnd < b.colStart || b.colEnd < a.colStart)
        )
    }

    public computeHorizontalBoundaries(boxes: AreaBox[]) {
        const result: BoundaryGroup[] = []

        let minCol = Infinity
        let maxCol = -Infinity

        for (const b of boxes) {
            minCol = Math.min(minCol, b.colStart)
            maxCol = Math.max(maxCol, b.colEnd)
        }

        const boundaries = new Set<number>()
        for (const b of boxes) boundaries.add(b.rowEnd)

        for (const row of boundaries) {
            let current: BoundaryGroup | null = null

            for (let col = minCol; col <= maxCol; col++) {
                const above = boxes.find((b) => b.rowEnd === row && col >= b.colStart && col <= b.colEnd)?.area

                const below = boxes.find((b) => b.rowStart === row + 1 && col >= b.colStart && col <= b.colEnd)?.area

                if (!above || !below || above === below) {
                    if (current) {
                        result.push(current)
                        current = null
                    }
                    continue
                }

                if (!current) {
                    current = { first: [], second: [] }
                }

                if (!current.first.includes(above)) current.first.push(above)
                if (!current.second.includes(below)) current.second.push(below)
            }

            if (current) result.push(current)
        }

        this.horizontalBoundary = result
    }

    public computeVerticalBoundaries(boxes: AreaBox[]) {
        const result: BoundaryGroup[] = []

        let minRow = Infinity
        let maxRow = -Infinity

        for (const b of boxes) {
            minRow = Math.min(minRow, b.rowStart)
            maxRow = Math.max(maxRow, b.rowEnd)
        }

        const boundaries = new Set<number>()
        for (const b of boxes) boundaries.add(b.colEnd)

        for (const col of boundaries) {
            let current: BoundaryGroup | null = null

            for (let row = minRow; row <= maxRow; row++) {
                const left = boxes.find((b) => b.colEnd === col && row >= b.rowStart && row <= b.rowEnd)?.area

                const right = boxes.find((b) => b.colStart === col + 1 && row >= b.rowStart && row <= b.rowEnd)?.area

                if (!left || !right || left === right) {
                    if (current) {
                        result.push(current)
                        current = null
                    }
                    continue
                }

                if (!current) {
                    current = { first: [], second: [] }
                }

                if (!current.first.includes(left)) current.first.push(left)
                if (!current.second.includes(right)) current.second.push(right)
            }

            if (current) result.push(current)
        }

        this.verticalBoundary = result
    }

    public resolveHandle(handle: ResizeHandle): ResolvedResizeHandle {
        const a = this.boxes[handle.between[0]]
        const b = this.boxes[handle.between[1]]

        if (!a || !b) {
            throw new Error('Invalid area name in resize handle')
        }

        if (this.isVerticalNeighbor(a, b)) {
            return {
                handle,
                direction: 'vertical',
                gridLine: Math.max(a.colEnd, b.colEnd),
            }
        }

        if (this.isHorizontalNeighbor(a, b)) {
            return {
                handle,
                direction: 'horizontal',
                gridLine: Math.max(a.rowEnd, b.rowEnd),
            }
        }

        throw new Error(`Areas "${a.area}" and "${b.area}" do not share a border`)
    }
}
