export type AreaName = string

export type TrackSize = number | `${number}px` | `${number}fr` | 'auto'

export type GridAreas = string[][]

export interface GridLayout {
    rows: string
    columns: string
    gap?: number
    areas: GridAreas
}

export interface Rect {
    x: number
    y: number
    width: number
    height: number
}

export type ComputedLayout = Record<AreaName, Rect>
