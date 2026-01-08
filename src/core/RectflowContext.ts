import { AreaTopology } from './AreaTopology'
import { LayoutEngine } from './LayoutEngine'
import { assertContainer } from '../helper/assertContainer'
import { assertLayoutConfig } from '../helper/assertLayoutConfig'
import type { RectflowOptions, ResolvedRectflowOptions } from '../types/RectflowOptions'
import type { ComputedLayout, LayoutConfig } from '../types/LayoutConfig'

export class RectflowContext {
    public readonly options: ResolvedRectflowOptions
    public readonly areaTopology: AreaTopology
    public readonly layoutEngine: LayoutEngine

    public onLayoutChange?: () => void
    public computedLayout: ComputedLayout

    constructor(rawOptions: RectflowOptions) {
        const resolved = this.resolveOptions(rawOptions)
        this.options = resolved

        this.initContainerStyle()

        this.areaTopology = new AreaTopology(resolved.layout.areas)

        this.layoutEngine = new LayoutEngine(resolved.layout, this.areaTopology.boxes, resolved.container)
        this.computedLayout = this.layoutEngine.computedLayout
    }

    private resolveOptions(options: RectflowOptions): ResolvedRectflowOptions {
        const container = this.normalizeContainer(options.container)
        const layout = this.normalizeLayout(options.layout)

        assertContainer(container)
        assertLayoutConfig(options.layout)

        return {
            container,
            layout,
            strict: options.strict ?? true,
        }
    }

    private normalizeContainer(container: HTMLElement | string | null): HTMLElement {
        if (typeof container === 'string') {
            container = document.querySelector<HTMLElement>(container)
        }

        assertContainer(container)
        return container
    }

    private normalizeLayout(layout: LayoutConfig): LayoutConfig {
        if (!layout.gap) layout.gap = 0
        layout.areas = this.normalizeAreas(layout.areas)

        return layout
    }

    private normalizeAreas(areas: string[][]): string[][] {
        return areas.map((row) => (row.length === 1 ? row[0].trim().split(/\s+/) : row))
    }

    private initContainerStyle() {
        const { container } = this.options

        container.style.position = 'absolute'
    }
}
