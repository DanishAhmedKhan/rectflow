import type { Rect } from '../core/Rect'
import type { ResizeConfig } from './ResizeTypes'

export type AreaName = string
export type LayoutAreas = string[][]
export type ComputedRect = Record<AreaName, Rect>

export interface LayoutConfig {
    rows: string
    columns: string
    areas: LayoutAreas
    gap?: number
    resize?: ResizeConfig
}
