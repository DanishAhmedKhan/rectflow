import type { ComputedLayout } from '../types/LayoutConfig'
import { Area } from './AreaView'

export class AreaStore {
    private areas = new Map<string, Area>()

    public loadFromLayout(layout: ComputedLayout) {
        this.areas.clear()
        for (const [name, rect] of Object.entries(layout)) {
            this.areas.set(name, new Area(name, ...rect))
        }
    }

    public get(name: string): Area {
        const area = this.areas.get(name)
        if (!area) throw new Error(`Area "${name}" not found`)
        return area
    }

    public toLayout(): ComputedLayout {
        const out: ComputedLayout = {}
        for (const [name, area] of this.areas) {
            out[name] = {
                x: area.x,
                y: area.y,
                width: area.width,
                height: area.height,
            }
        }
        return out
    }
}
