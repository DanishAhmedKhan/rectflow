import { OptionResolver } from './OptionResolver'
import type { RectflowOptions, ResolvedRectflowOptions } from '../types/RectflowOptions'

export class RectflowOptionsStore {
    private _options: ResolvedRectflowOptions
    private readonly resolver: OptionResolver

    constructor(initial: RectflowOptions, resolver = new OptionResolver()) {
        this.resolver = resolver
        this._options = Object.freeze(this.resolver.resolve(initial))
    }

    get options(): ResolvedRectflowOptions {
        return this._options
    }
}
