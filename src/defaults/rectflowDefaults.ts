import type { ResolvedRectflowOptions } from '../types/RectflowOptions'
import type { Resolved } from '../types/Resolved'

export const RECTFLOW_DEFAULTS: Required<Resolved<ResolvedRectflowOptions>> = {
    container: null as any,
    layout: {
        rows: '',
        columns: '',
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
                // style: {
                //     color: 'red',
                //     hoverColor: 'blue',
                //     activeColor: 'green',
                // },
            },
        },
    },
    strict: true,
}
