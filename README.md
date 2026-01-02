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
<div class="main"></div>
```

### JavaScript

```ts
const mainElem = document.querySelector('.main')

const rectflow = new Rectflow({
    container: mainElem,
    layout: {
        rows: '50px auto 50px',
        columns: '50px auto 100px',
        gap: 5,
        areas: [
            ['tool tool tool'], 
            ['drawing chart widget'], 
            ['drawing base widget']
        ],
    },
})

rectflow.layout()
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

Rectflow listens to container resize events and automatically recalculates layout:

-   Uses `ResizeObserver`
-   Re-applies positions when size changes

No manual resize handling required.

---

## ⚙️ API Reference

### `new Rectflow(config)`

#### config

```ts
{
    container: HTMLElement
    layout: {
        rows: string
        columns: string
        gap?: number
        areas: string[][]
    }
}
```

---

### `registerArea(name, element)`

Registers an existing DOM element for an area.

```ts
rectflow.registerArea('chart', chartElement)
```

---

### `layout()`

Calculates layout and applies styles.

```ts
rectflow.layout()
```

---

## 📄 License

MIT

---

## ❤️ Inspiration

Inspired by:

-   CSS Grid
-   Game UI layout systems
-   Charting & trading platforms
-   Dashboards

---

If you’re building editors, dashboards, charting tools, or canvas-heavy apps — Rectflow is built for you.
