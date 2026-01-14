# Rectflow

A lightweight **JavaScript layout engine** inspired by CSS Grid, designed for **programmatic layouts**, canvas-heavy apps, charting tools, editors, and environments where CSS Grid is not flexible enough.

Rectflow lets you define rows, columns, gaps, and named areas — then calculates and applies absolute positions automatically.

---

## ✨ Features

-   CSS-Grid–like API (rows, columns, areas)
-   Works **without CSS Grid** (pure JS layout engine)
-   Supports:

    -   `fr`, `px`, `auto` tracks
    -   Gaps
    -   Named areas

-   Automatic DOM creation for missing areas
-   Resize-aware (re-layout on container resize)
-   Interactive area resizing using draggable gutters
-   CDN-ready bundle + npm package

---

## 📦 Installation

### Using npm

```bash
npm install rectflow
```

```ts
import { Rectflow } from 'rectflow'
```

### Using CDN

```html
<script src="https://unpkg.com/rectflow/dist/rectflow.umd.js"></script>
<script>
    const rectflow = new Rectflow(...)
</script>
```

---

## 🚀 Basic Usage

### HTML

```html
<div id="container"></div>
```

### CSS

```css
#container {
    width: 100%;
    height: 100vh;
}
```

⚠️ Important:
If the container does not have a defined height, Rectflow will not be able to calculate or render the layout correctly.

### JavaScript

```ts
const containerElem = document.getElementById('container')

const rectflow = new Rectflow({
    container: containerElem,
    layout: {
        rows: '60px auto 60px',
        columns: '60px 240px auto 60px',
        gap: 6,
        areas: [
            ['A A A A'],
            ['B E C D'],
            ['B E F D'],
        ],
        resize?: {
            handles: [
                { between: ['C', 'F'] },
                { between: ['E', 'C'] },
            ],
            gutter: {
                size: 4,
                style: {
                    hoverColor: 'rgba(0, 0, 0, 0.1)',
                }
            },
        }
    }
})

```

---

## 🧩 Areas Syntax

Rectflow supports **two area formats**:

### Shortcut (recommended)

```ts
areas: [
    ['tool tool'], 
    ['drawing chart']
]
```

### Expanded form

```ts
areas: [
    ['tool', 'tool'],
    ['drawing', 'chart'],
]
```

Both are equivalent.

---

## 🧠 Automatic Area Creation

If an area is defined in `areas` but **not registered**, Rectflow will:

-   Automatically create a `<div>`
-   Assign it the area name
-   Insert it into the container
-   Apply a random background color (for debugging)

This makes rapid prototyping easy.

---

## 🔁 Resize Handling

Rectflow automatically recalculates the layout when the container size changes.

It also supports **interactive resizing of individual areas** using draggable gutters, allowing users to dynamically adjust the layout at runtime.

---

## ⚙️ API Reference

### `new Rectflow(options)`

#### options

```ts
{
    container: HTMLElement
    layout: {
        rows: string
        columns: string
        areas: string[][]
        gap?: number
        resize: {
            handles: {
                between: string[]
            }[]
            gutter: {
                size: number
                color?: string
                hoverColor?: string
                activeColor?: string
            }
        }
    }
}
```

Resize handles are automatically resolved as horizontal or vertical based on the shared boundary between areas.


### `getArea(name)`

Returns the HTML element for a given area and lets you perform your own custom logic on it.

```ts
rectflow.getArea('A')
```

---
## 🚫 Non-Goals
---

Rectflow is not intended to:

- Replace CSS Grid for static layouts
- Handle animations or transitions
- Manage application state

It focuses solely on **layout calculation and positioning**.

---
## 📄 License

MIT

---

## ❤️ Inspiration

Inspired by:

-   CSS Grid
-   Charting & trading platforms
-   Game UI layout systems
-   Code Editors
-   Dashboards

---

If you’re building editors, dashboards, charting tools, or canvas-heavy apps — Rectflow is built for you.
