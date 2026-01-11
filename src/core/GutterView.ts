import type { Rect } from './Rect'
import { RectView } from './RectView'

type GutterOrientation = 'horizontal' | 'vertical'

export class GutterView extends RectView {
    constructor(private orientation: GutterOrientation, rect: Rect) {
        super(rect)
    }
}
