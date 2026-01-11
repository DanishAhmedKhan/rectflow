import { RectView } from './RectView'
import type { RectOption } from '../types/RectOption'

export class AreaView extends RectView {
    constructor(private name: string, rect: RectOption) {
        super(rect)
    }

    public isArea(name: string) {
        return this.name === name
    }
}
