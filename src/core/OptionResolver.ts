import { RECTFLOW_DEFAULTS } from '../defaults/rectflowDefaults'
import { RectflowError } from '../error/RectflowError'
import { ErrorCode } from '../error/ErrorCode'
import { deepMerge } from '../helper/deepMerge'
import type { RectflowOptions, ResolvedRectflowOptions } from '../types/RectflowOptions'

export class OptinResolver {
    private options!: RectflowOptions

    public resolve(options: RectflowOptions): ResolvedRectflowOptions {
        this.options = options

        this.normalizeContainer()
        this.normalizeAreas()
        this.normalizeGutter()

        this.validateContainer()
        this.validateRowsCols()
        this.validateAreasMatrix()
        this.validateResizeHandles()
        this.validateGutter()

        const resolvedOptions = deepMerge<RectflowOptions>(RECTFLOW_DEFAULTS, options)
        return resolvedOptions as ResolvedRectflowOptions
    }

    private normalizeContainer() {
        const container = this.options.container

        if (typeof container === 'string') {
            const elem = document.querySelector<HTMLElement>(container)

            if (!elem) {
                throw new RectflowError(
                    `Container selector "${container}" does not match any element in HTML`,
                    ErrorCode.CONTAINER_NOT_FOUND,
                )
            }

            this.options.container = elem
        }
    }

    private normalizeAreas() {
        const { areas } = this.options.layout

        if (!Array.isArray(areas)) {
            throw new RectflowError(`layout.areas must be an array of rows (string[][])`, ErrorCode.INVALID_LAYOUT)
        }

        this.options.layout.areas = areas.map((row, rowIndex) => {
            if (!Array.isArray(row)) {
                throw new RectflowError(`layout.areas[${rowIndex}] must be an array`, ErrorCode.INVALID_LAYOUT)
            }

            if (row.length === 1) {
                const value = row[0]

                if (typeof value !== 'string') {
                    throw new RectflowError(`layout.areas[${rowIndex}][0] must be a string`, ErrorCode.INVALID_LAYOUT)
                }

                const tokens = value.trim().split(/\s+/)

                if (tokens.length === 0 || tokens.some((t) => !t)) {
                    throw new RectflowError(
                        `layout.areas[${rowIndex}] contains invalid area names`,
                        ErrorCode.INVALID_LAYOUT,
                    )
                }

                return tokens
            }

            return row.map((cell, colIndex) => {
                if (typeof cell !== 'string') {
                    throw new RectflowError(
                        `layout.areas[${rowIndex}][${colIndex}] must be a string`,
                        ErrorCode.INVALID_LAYOUT,
                    )
                }

                if (!cell.trim()) {
                    throw new RectflowError(
                        `layout.areas[${rowIndex}][${colIndex}] cannot be empty`,
                        ErrorCode.INVALID_LAYOUT,
                    )
                }

                return cell.trim()
            })
        })
    }

    private normalizeGutter() {
        if (!this.options.layout.resize) return
        const gutter = this.options.layout.resize.gutter

        if (typeof gutter === 'number') this.options.layout.resize.gutter = { size: 6 }
    }

    private validateContainer() {
        const container = this.options.container

        if (!container) {
            throw new RectflowError('Container is null or undefined', ErrorCode.CONTAINER_NOT_FOUND)
        }

        if (!(container instanceof HTMLElement)) {
            throw new RectflowError('Provided container is not a valid HTMLElement', ErrorCode.INVALID_CONTAINER)
        }
    }

    private validateRowsCols() {
        const validateTrack = (value: unknown, context: 'rows' | 'columns') => {
            if (value == null) {
                throw new RectflowError(`layout.${context} is required`, ErrorCode.INVALID_LAYOUT)
            }

            if (typeof value !== 'string') {
                throw new RectflowError(`layout.${context} must be a string`, ErrorCode.INVALID_LAYOUT)
            }

            if (!value.trim()) {
                throw new RectflowError(`layout.${context} cannot be empty`, ErrorCode.INVALID_LAYOUT)
            }

            const TRACK_REGEX = /^(auto|\d+(\.\d+)?(px|fr))$/
            const tokens = value.trim().split(/\s+/)

            for (const token of tokens) {
                if (!TRACK_REGEX.test(token)) {
                    throw new RectflowError(
                        `Invalid layout.${context} track value "${token}". ` +
                            `Allowed values: px (e.g. 60px), fr (e.g. 1fr), or auto.`,
                        ErrorCode.INVALID_LAYOUT,
                    )
                }
            }
        }

        validateTrack(this.options.layout.rows, 'rows')
        validateTrack(this.options.layout.columns, 'columns')
    }

    private validateAreasMatrix() {
        const areas = this.options.layout.areas
        const rowsDef = this.options.layout.rows
        const columnsDef = this.options.layout.columns

        const rowCount = rowsDef.trim().split(/\s+/).length
        const columnCount = columnsDef.trim().split(/\s+/).length

        if (areas.length !== rowCount) {
            throw new RectflowError(
                `Areas row count (${areas.length}) does not match rows definition (${rowCount})`,
                ErrorCode.INVALID_LAYOUT,
            )
        }

        for (let r = 0; r < areas.length; r++) {
            const row = areas[r]

            if (row.length !== columnCount) {
                throw new RectflowError(
                    `Areas column count mismatch at row ${r}. ` + `Expected ${columnCount}, got ${row.length}`,
                    ErrorCode.INVALID_LAYOUT,
                )
            }
        }
    }

    private validateResizeHandles() {
        const resize = this.options.layout.resize
        if (!resize || !resize.handles) return

        const { handles } = resize

        if (!Array.isArray(handles)) {
            throw new RectflowError(`resize.handles must be an array`, ErrorCode.INVALID_LAYOUT)
        }

        function collectAreaNames(areas: string[][]): Set<string> {
            const set = new Set<string>()
            for (const row of areas) {
                for (const name of row) {
                    set.add(name)
                }
            }
            return set
        }

        const validAreas = collectAreaNames(this.options.layout.areas)

        handles.forEach((handle, index) => {
            if (typeof handle !== 'object' || handle === null) {
                throw new RectflowError(`resize.handles[${index}] must be an object`, ErrorCode.INVALID_LAYOUT)
            }

            if (!('between' in handle)) {
                throw new RectflowError(
                    `resize.handles[${index}] is missing required property "between"`,
                    ErrorCode.INVALID_LAYOUT,
                )
            }

            const between = (handle as any).between

            if (!Array.isArray(between)) {
                throw new RectflowError(`resize.handles[${index}].between must be an array`, ErrorCode.INVALID_LAYOUT)
            }

            if (between.length !== 2) {
                throw new RectflowError(
                    `resize.handles[${index}].between must contain exactly 2 area names`,
                    ErrorCode.INVALID_LAYOUT,
                )
            }

            const [a, b] = between

            if (typeof a !== 'string' || typeof b !== 'string') {
                throw new RectflowError(
                    `resize.handles[${index}].between values must be strings`,
                    ErrorCode.INVALID_LAYOUT,
                )
            }

            if (!a.trim() || !b.trim()) {
                throw new RectflowError(
                    `resize.handles[${index}].between cannot contain empty strings`,
                    ErrorCode.INVALID_LAYOUT,
                )
            }

            if (a === b) {
                throw new RectflowError(
                    `resize.handles[${index}].between must reference two different areas`,
                    ErrorCode.INVALID_LAYOUT,
                )
            }

            if (!validAreas.has(a) || !validAreas.has(b)) {
                throw new RectflowError(
                    `resize.handles[${index}] references unknown areas: ${a}, ${b}`,
                    ErrorCode.INVALID_LAYOUT,
                )
            }
        })
    }

    private validateGutter() {
        const resize = this.options.layout.resize
        if (!resize || resize.gutter == null) return

        const { gutter } = resize

        if (typeof gutter === 'number') {
            if (!Number.isFinite(gutter) || gutter < 0) {
                throw new RectflowError(`resize.gutter must be a non-negative number`, ErrorCode.INVALID_LAYOUT)
            }
            return
        }

        if (typeof gutter !== 'object') {
            throw new RectflowError(`resize.gutter must be a number or an object`, ErrorCode.INVALID_LAYOUT)
        }

        const { size, style } = gutter as any

        if (size !== undefined) {
            if (typeof size !== 'number' || !Number.isFinite(size) || size < 0) {
                throw new RectflowError(`resize.gutter.size must be a non-negative number`, ErrorCode.INVALID_LAYOUT)
            }
        }

        function isValidCssColor(value: string): boolean {
            const s = new Option().style
            s.color = value
            return s.color !== ''
        }

        const assertValidColor = (value: unknown, path: string) => {
            if (typeof value !== 'string') {
                throw new RectflowError(`${path} must be a string`, ErrorCode.INVALID_LAYOUT)
            }

            if (!isValidCssColor(value)) {
                throw new RectflowError(`${path} is not a valid CSS color`, ErrorCode.INVALID_LAYOUT)
            }
        }

        if (style !== undefined) {
            if (typeof style !== 'object' || style === null) {
                throw new RectflowError(`resize.gutter.style must be an object`, ErrorCode.INVALID_LAYOUT)
            }

            const { color, hoverColor, activeColor } = style as any

            if (color !== undefined) {
                assertValidColor(color, 'resize.gutter.style.color')
            }

            if (hoverColor !== undefined) {
                assertValidColor(hoverColor, 'resize.gutter.style.hoverColor')
            }

            if (activeColor !== undefined) {
                assertValidColor(activeColor, 'resize.gutter.style.activeColor')
            }
        }
    }
}
