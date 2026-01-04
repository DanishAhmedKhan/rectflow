export type AreaName = string
export type ResizeDirection = 'horizontal' | 'vertical'

export interface ResizeHandle {
    between: [AreaName, AreaName]
    min?: number
    max?: number
}

export interface ResizeConfig {
    handles: ResizeHandle[]
    gutter?: number
}

export interface ResolvedResizeHandle {
    handle: ResizeHandle
    direction: ResizeDirection
    gridLine: number
}

export interface SizeConstraint {
    min?: number
    max?: number
}
