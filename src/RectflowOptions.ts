import type { GridConfig } from './Grid'

export interface RectflowOptions {
    container: HTMLElement | null
    layout: GridConfig
    strict?: boolean
}
