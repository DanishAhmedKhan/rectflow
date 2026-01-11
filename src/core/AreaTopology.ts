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

type AxisKey = 'rowStart' | 'rowEnd' | 'colStart' | 'colEnd'

export type BoundaryGroup = {
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

    public computeBoundaries(
        boxes: AreaBox[],
        primaryEnd: AxisKey,
        primaryStart: AxisKey,
        secondaryStart: AxisKey,
        secondaryEnd: AxisKey,
    ): BoundaryGroup[] {
        const result: BoundaryGroup[] = []

        let minSecondary = Infinity
        let maxSecondary = -Infinity

        for (const b of boxes) {
            minSecondary = Math.min(minSecondary, b[secondaryStart])
            maxSecondary = Math.max(maxSecondary, b[secondaryEnd])
        }

        const boundaries = new Set<number>()
        for (const b of boxes) boundaries.add(b[primaryEnd])

        for (const boundary of boundaries) {
            let current: BoundaryGroup | null = null

            for (let s = minSecondary; s <= maxSecondary; s++) {
                const first = boxes.find(
                    (b) => b[primaryEnd] === boundary && s >= b[secondaryStart] && s <= b[secondaryEnd],
                )?.area

                const second = boxes.find(
                    (b) => b[primaryStart] === boundary + 1 && s >= b[secondaryStart] && s <= b[secondaryEnd],
                )?.area

                if (!first || !second || first === second) {
                    if (current) {
                        result.push(current)
                        current = null
                    }
                    continue
                }

                if (!current) {
                    current = { first: [], second: [] }
                }

                if (!current.first.includes(first)) current.first.push(first)
                if (!current.second.includes(second)) current.second.push(second)
            }

            if (current) result.push(current)
        }

        return result
    }

    public computeHorizontalBoundaries(boxes: AreaBox[]) {
        this.horizontalBoundary = this.computeBoundaries(boxes, 'rowEnd', 'rowStart', 'colStart', 'colEnd')
    }

    public computeVerticalBoundaries(boxes: AreaBox[]) {
        this.verticalBoundary = this.computeBoundaries(boxes, 'colEnd', 'colStart', 'rowStart', 'rowEnd')
    }
}
