import type { DeepPartial } from '../types/DeepPartial'

export function deepMerge<T>(base: DeepPartial<T>, override?: DeepPartial<T>): DeepPartial<T> {
    if (override == null) {
        return structuredClone(base)
    }

    if (typeof base !== 'object' || base === null) {
        return override
    }

    const result: any = structuredClone(base)

    for (const key in override) {
        const oVal = override[key]
        const bVal = result[key]

        if (oVal !== null && typeof oVal === 'object' && !Array.isArray(oVal)) {
            result[key] = deepMerge(bVal, oVal)
        } else if (oVal !== undefined) {
            result[key] = oVal
        }
    }

    return result
}
