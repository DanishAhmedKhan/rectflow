export type AreaName = string
export type ResizeDirection = 'horizontal' | 'vertical'

export interface ResizeHandle {
    between: [AreaName, AreaName]
    min?: number
    max?: number
}

export interface GutterConfig {
    size: number
    delay?: number
    style?: {
        color?: string
        hoverColor?: string
        activeColor?: string
    }
}

export interface ResizeConstraint {
    min?: number
    max?: number
    step?: number
}

export interface ContraintsConfig {
    default?: ResizeConstraint
    areas: {
        [key: string]: ResizeConstraint
    }
}

export interface ResizeConfig {
    handles: ResizeHandle[]
    gutter: number | GutterConfig
    constraints?: ContraintsConfig
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
