export function deepMerge<T>(base: T, override?: Partial<T>): T {
    if (override == null) {
        return structuredClone(base)
    }

    // If base is not an object, override wins
    if (typeof base !== 'object' || base === null) {
        return override as T
    }

    const result: any = structuredClone(base)

    for (const key in override) {
        const oVal = override[key]
        const bVal = (result as any)[key]

        if (oVal !== null && typeof oVal === 'object' && !Array.isArray(oVal)) {
            result[key] = deepMerge(bVal, oVal)
        } else if (oVal !== undefined) {
            result[key] = oVal
        }
    }

    return result
}
