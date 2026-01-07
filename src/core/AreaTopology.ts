import type { LayoutAreas } from '../types/LayoutConfig'
import type { ResizeHandle, ResolvedResizeHandle } from '../types/ResizeTypes'

type Cell = {
    area: AreaName
    row: number
    col: number
}

type AreaBox = {
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
    private cells: Cell[] = []
    private boxes: Map<AreaName, AreaBox> = new Map<AreaName, AreaBox>()

    constructor(private layoutAreas: LayoutAreas) {
        this.buildCells()
        this.computeBoxes()
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

    private computeBoxes() {
        for (const cell of this.cells) {
            if (!this.boxes.has(cell.area)) {
                this.boxes.set(cell.area, {
                    area: cell.area,
                    rowStart: cell.row,
                    rowEnd: cell.row,
                    colStart: cell.col,
                    colEnd: cell.col,
                })
            } else {
                const box = this.boxes.get(cell.area)!
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

    private rangesOverlap(aStart: number, aEnd: number, bStart: number, bEnd: number) {
        return !(aEnd < bStart || bEnd < aStart)
    }

    computeHorizontalBoundaries(boxes: AreaBox[]): BoundaryGroup[] {
        const map = new Map<number, BoundaryGroup>()

        for (let i = 0; i < boxes.length; i++) {
            for (let j = 0; j < boxes.length; j++) {
                if (i === j) continue

                const a = boxes[i]
                const b = boxes[j]

                // a is directly above b
                if (a.rowEnd + 1 === b.rowStart && this.rangesOverlap(a.colStart, a.colEnd, b.colStart, b.colEnd)) {
                    const key = a.rowEnd

                    if (!map.has(key)) {
                        map.set(key, { first: [], second: [] })
                    }

                    const group = map.get(key)!

                    if (!group.first.includes(a.area)) {
                        group.first.push(a.area)
                    }
                    if (!group.second.includes(b.area)) {
                        group.second.push(b.area)
                    }
                }
            }
        }

        return [...map.values()]
    }

    public resolveHandle(handle: ResizeHandle): ResolvedResizeHandle {
        const a = this.boxes.get(handle.between[0])
        const b = this.boxes.get(handle.between[1])

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
