import { AreaView } from './AreaView'
import { randomColor } from '../helper/randomColor'
import type { RectflowContext } from './RectflowContext'
import type { AreaName } from '../types/ResizeTypes'

export class AreaRenderer {
    private areas: Record<AreaName, AreaView> = {}

    constructor(private context: RectflowContext) {
        const computedRect = this.context.layoutEngine.computedRect

        for (const name in computedRect) {
            const rect = computedRect[name]
            const areaView = new AreaView(name, rect)
            this.areas[name] = areaView
            areaView.elem.style.overflow = 'hidden'
            areaView.elem.innerHTML = name
            areaView.elem.dataset.rectflowArea = name
        }
    }

    public apply() {
        Object.values(this.areas).forEach((areaView) => {
            areaView.elem.style.background = randomColor()
            areaView.mount(this.context.options.container)
        })
    }

    public getView(name: AreaName): AreaView | undefined {
        return this.areas[name]
    }

    public getAreaElement(areaName: AreaName) {
        return this.areas[areaName].elem
    }

    public clear() {
        Object.values(this.areas).forEach((area) => area.remove())
    }
}
