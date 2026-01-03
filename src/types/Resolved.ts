export type Resolved<T> = {
    [K in keyof T]-?: NonNullable<T[K]>
}
