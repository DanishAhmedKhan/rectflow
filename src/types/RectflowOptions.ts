import type { LayoutConfig } from './LayoutConfig'

export interface RectflowOptions {
    container: HTMLElement | string | null
    layout: LayoutConfig
    strict?: boolean
}

export type ResolvedRectflowOptions = Readonly<{
    container: HTMLElement
    layout: {
        rows: string
        columns: string
        gap: number
        areas: string[][]
        resize?: {
            handles: {
                between: [string, string]
                min?: number
                max?: number
            }[]
            gutter?: {
                size: number
                delay?: number
                style?: {
                    color?: string
                    hoverColor?: string
                    activeColor?: string
                }
            }
        }
    }
    strict: boolean
}>
