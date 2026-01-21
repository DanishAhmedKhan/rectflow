import type { DeepPartial } from '../types/DeepPartial'
import type { RectflowOptions } from '../types/RectflowOptions'

export const RECTFLOW_DEFAULTS = {
    layout: {
        gap: 0,
        areas: [],
        resize: {
            handles: [],
            gutter: {
                size: 6,
                delay: 150,
                style: {
                    color: 'transparent',
                    hoverColor: 'rgba(0,0,0,0.25)',
                    activeColor: 'rgba(0,0,0,0.45)',
                },
            },
        },
    },
    strict: true,
} satisfies DeepPartial<RectflowOptions>
