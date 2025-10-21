# Observable Plot Scatter with Brush Selection

A React + Vite + TypeScript app demonstrating an Observable Plot scatter plot with rectangular brush selection using a D3 brush overlay.

## Features

- 📊 Observable Plot for declarative data visualization
- 🖱️ Interactive brush selection – drag to select data points
- 🎨 Live visual feedback – selected points highlighted, non-selected dimmed
- 📈 Real-time counter showing number of selected points
- 🎮 **Controlled selection** – programmatically set selection from props
- 🔄 Bidirectional data flow – selection updates flow both ways

## Tech Stack

- Vite 5
- React 18 + TypeScript 5
- @observablehq/plot – declarative plotting library
- d3-brush – rectangular selection interaction

## Getting Started

```sh
pnpm install
pnpm dev
```

Open your browser and navigate to the local dev server (typically `http://localhost:5173`).

## Usage

### Interactive Selection

- **Drag** within the chart area to create a rectangular selection
- **Selected points** remain fully visible; non-selected points are dimmed
- The **"Selected: N"** counter updates in real-time
- **Click outside** the selection or brush over empty area to clear
- **Press Escape** to clear the selection

### Controlled Selection (New!)

The ScatterPlot component now supports controlled selection, allowing you to programmatically set the selection from your code. See [CONTROLLED_SELECTION.md](./CONTROLLED_SELECTION.md) for detailed documentation.

```tsx
<ScatterPlot
  data={myData}
  selection={selection} // Control selection via prop
  onSelectionChange={(points, sel) => setSelection(sel)}
/>
```

## Implementation Notes

The key challenge was correctly identifying the main SVG when Plot wraps charts in a `<figure>` with multiple SVG elements (chart + legend swatches). The code selects the **largest SVG by area** to ensure the brush overlays the main plot.

The brush is appended inside the **same parent group** as the circle elements, ensuring coordinate alignment. The extent is computed from the marks group's bounding box.

## Project Structure

- `src/components/ScatterPlot/` – Modular scatter plot component library
  - `ScatterPlot.tsx` – Main component with controlled selection support
  - `brush.ts` – Brush creation and programmatic control utilities
  - `plot.ts` – Observable Plot configuration and helpers
  - `types.ts` – TypeScript type definitions
  - `examples.tsx` – Usage examples including controlled selection demo
  - `legends.ts` – Legend creation utilities
  - `utils.ts` – Helper functions
- `src/components/PlotScatterBrush.tsx` – Original demo component
- `src/App.tsx` – Page layout
- `src/main.tsx` – React entry point
- `src/styles.css` – Application styles
- `CONTROLLED_SELECTION.md` – Documentation for controlled selection feature
- `IMPLEMENTATION_SUMMARY.md` – Summary of recent implementation changes
