import { AreaView } from './view/AreaView'
import type { RectflowContext } from './RectflowContext'
import type { AreaName } from '../types/ResizeTypes'

export class AreaRenderer {
    private areas: Record<AreaName, AreaView> = {}

    constructor(private context: RectflowContext) {}

    public apply() {
        const container = this.context.options.container
        const computedRect = this.context.layoutEngine.computedRect

        for (const name in this.areas) {
            if (!computedRect[name]) {
                this.areas[name].remove()
                delete this.areas[name]
            }
        }

        for (const name in computedRect) {
            const rect = computedRect[name]

            let areaView = this.areas[name]

            if (!areaView) {
                areaView = new AreaView(name, rect)
                this.areas[name] = areaView

                areaView.elem.style.overflow = 'hidden'
                areaView.elem.dataset.rectflowArea = name
                areaView.elem.style.background = 'white'

                areaView.mount(container)
            } else {
                areaView.update(rect)
            }
        }
    }

    public getView(name: AreaName): AreaView | undefined {
        return this.areas[name]
    }

    public getAreaElement(areaName: AreaName) {
        return this.areas[areaName].elem
    }

    public clear() {
        Object.values(this.areas).forEach((area) => area.remove())
        this.areas = {}
    }
}
