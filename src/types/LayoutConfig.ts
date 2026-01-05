import type { ResizeConfig } from './ResizeTypes'

export type AreaName = string
export type LayoutAreas = string[][]
export type ComputedLayout = Record<AreaName, Rect>

export interface Rect {
    x: number
    y: number
    width: number
    height: number
}

export interface LayoutConfig {
    rows: string
    columns: string
    areas: LayoutAreas
    gap?: number
    resize?: ResizeConfig
}
