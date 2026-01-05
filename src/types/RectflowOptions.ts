import type { LayoutConfig } from './LayoutConfig'

export interface RectflowOptions {
    container: HTMLElement | string | null
    layout: LayoutConfig
    strict?: boolean
}

export interface ResolvedRectflowOptions {
    container: HTMLElement
    layout: LayoutConfig
    strict: boolean
}
