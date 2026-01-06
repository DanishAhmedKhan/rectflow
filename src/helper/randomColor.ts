export function randomColor(): string {
    const hue = Math.floor(Math.random() * 360)
    const saturation = Math.floor(50 + Math.random() * 40)
    const lightness = Math.floor(55 + Math.random() * 25)

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}
