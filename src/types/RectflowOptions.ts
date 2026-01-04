import type { LayoutConfig } from './LayoutConfig'

export interface RectflowOptions {
    container: HTMLElement | null
    layout: LayoutConfig
    strict?: boolean
}
