import type { LayoutAreas } from '../types/LayoutConfig'
import type { AreaName, ResizeHandle, ResolvedResizeHandle } from '../types/ResizeTypes'

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

type BoundaryId = string

interface HorizontalBoundary {
    id: BoundaryId
    y: number

    // areas touching this boundary
    above: Set<string> // area names
    below: Set<string>
}

export class AreaTopology {
    private cells: Cell[] = []

    private horizontalBoundaries = new Map<BoundaryId, HorizontalBoundary>()
    private areaToBoundaries = new Map<
        string,
        {
            top?: BoundaryId
            bottom?: BoundaryId
        }
    >()

    constructor(private layoutAreas: LayoutAreas) {
        this.buildCells()
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

        console.log(this.cells)
    }

    private computeBoxes(): Map<AreaName, AreaBox> {
        const map = new Map<AreaName, AreaBox>()

        for (const cell of this.cells) {
            if (!map.has(cell.area)) {
                map.set(cell.area, {
                    area: cell.area,
                    rowStart: cell.row,
                    rowEnd: cell.row,
                    colStart: cell.col,
                    colEnd: cell.col,
                })
            } else {
                const box = map.get(cell.area)!
                box.rowStart = Math.min(box.rowStart, cell.row)
                box.rowEnd = Math.max(box.rowEnd, cell.row)
                box.colStart = Math.min(box.colStart, cell.col)
                box.colEnd = Math.max(box.colEnd, cell.col)
            }
        }

        return map
    }

    // AAAAAA
    // BCCCDF
    // BCCCDF
    // BEEEDF
    // GGGGHH
    // JJLLKK

    // horizontal = [
    //     {
    //         above: [A],
    //         below: [B C D F],
    //     }
    //     {
    //         above: [],
    //         below: [],
    //     }
    // ]

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

    public resolveHandle(handle: ResizeHandle): ResolvedResizeHandle {
        const boxes = this.computeBoxes()
        const a = boxes.get(handle.between[0])
        const b = boxes.get(handle.between[1])

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
