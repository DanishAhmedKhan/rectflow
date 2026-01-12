import { RectView } from './RectView'
import type { Rect } from './Rect'
import type { BoundaryGroup } from './AreaTopology'

type GutterDirection = 'horizontal' | 'vertical'

export class GutterView extends RectView {
    constructor(public readonly direction: GutterDirection, public readonly boundary: BoundaryGroup, rect: Rect) {
        super(rect)
    }
}
