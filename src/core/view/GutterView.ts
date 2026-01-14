import { RectView } from './RectView'
import type { Rect } from '../Rect'
import type { BoundaryGroup } from '../AreaTopology'
import type { GutterConfig } from '../../types/ResizeTypes'

type GutterDirection = 'horizontal' | 'vertical'

type GutterState = 'idle' | 'hover' | 'active'

type GutterViewOptions = {
    config: GutterConfig
    direction: GutterDirection
    boundary: BoundaryGroup
}

export class GutterView extends RectView {
    private state: GutterState = 'idle'

    public readonly config: GutterConfig
    public readonly direction: GutterDirection
    public readonly boundary: BoundaryGroup

    constructor(options: GutterViewOptions, rect: Rect) {
        super(rect)

        this.config = options.config
        this.direction = options.direction
        this.boundary = options.boundary

        this.init()
    }

    private init() {
        const elem = this.elem

        elem.style.cursor = this.direction === 'horizontal' ? 'row-resize' : 'col-resize'
        elem.style.transition = 'background 0.2s'

        this.applyIdleStyle()
    }

    public setState(state: GutterState) {
        if (this.state === state) return
        this.state = state

        switch (state) {
            case 'idle':
                this.applyIdleStyle()
                break
            case 'hover':
                this.applyHoverStyle()
                break
            case 'active':
                this.applyActiveStyle()
                break
        }
    }

    private applyIdleStyle() {
        this.elem.style.background = this.config.style?.color ?? 'transparent'
    }

    private applyHoverStyle() {
        this.elem.style.background = this.config.style?.hoverColor ?? this.config.style?.color ?? 'rgba(0,0,0,0.1)'
    }

    private applyActiveStyle() {
        this.elem.style.background =
            this.config.style?.activeColor ?? this.config.style?.hoverColor ?? 'rgba(0,0,0,0.2)'
    }
}
