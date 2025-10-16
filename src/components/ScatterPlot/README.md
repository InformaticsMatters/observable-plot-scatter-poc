# ScatterPlot Component Library

A modular, reusable scatter plot visualization component built with React, Observable Plot, and D3.

## Features

- **4D Visualization**: Display data using x, y, size, and color channels
- **Interactive Brush Selection**: Drag to select points, resize and pan the selection box
- **Keyboard Support**: Press Escape to clear selection
- **Customizable Legends**: Automatic color bar and size legend generation
- **TypeScript Support**: Fully typed with comprehensive interfaces
- **Modular Architecture**: Easily reusable and extensible components

## Installation

```bash
npm install @observablehq/plot d3 react react-dom
# or
pnpm add @observablehq/plot d3 react react-dom
```

## Usage

### Basic Usage

```tsx
import { ScatterPlot, generateRandomData } from "./components/ScatterPlot";

function App() {
  const data = generateRandomData(800);

  return (
    <ScatterPlot
      data={data}
      config={{
        height: 600,
        width: 800,
        xLabel: "Variable X",
        yLabel: "Variable Y",
        sizeLabel: "Size",
        colorLabel: "Color",
        colorScheme: "turbo",
      }}
      enableBrush={true}
      showLegends={true}
    />
  );
}
```

### With Selection Callback

```tsx
import { ScatterPlot, Point, BrushSelection } from "./components/ScatterPlot";

function App() {
  const data = generateRandomData(800);

  const handleSelectionChange = (
    selectedPoints: Point[],
    selection: BrushSelection | null
  ) => {
    console.log(`Selected ${selectedPoints.length} points`);
    if (selection) {
      console.log(
        `Bounds: ${selection.x0}, ${selection.y0} to ${selection.x1}, ${selection.y1}`
      );
    }
  };

  return (
    <ScatterPlot
      data={data}
      onSelectionChange={handleSelectionChange}
      enableBrush={true}
    />
  );
}
```

## API Reference

### ScatterPlot Props

| Prop                | Type                                                           | Default      | Description                     |
| ------------------- | -------------------------------------------------------------- | ------------ | ------------------------------- |
| `data`              | `Point[]`                                                      | **required** | Array of data points            |
| `config`            | `ScatterPlotConfig`                                            | `{}`         | Plot configuration options      |
| `onSelectionChange` | `(points: Point[], selection: BrushSelection \| null) => void` | `undefined`  | Callback when selection changes |
| `enableBrush`       | `boolean`                                                      | `true`       | Enable brush selection          |
| `showLegends`       | `boolean`                                                      | `true`       | Show color and size legends     |

### Point Interface

```typescript
interface Point {
  x: number;
  y: number;
  size: number;
  color: number;
  [key: string]: any; // Additional properties allowed
}
```

### ScatterPlotConfig Interface

```typescript
interface ScatterPlotConfig {
  height?: number; // Default: 600
  width?: number; // Default: 800
  margin?: number; // Default: 60
  xLabel?: string; // Default: "Variable X"
  yLabel?: string; // Default: "Variable Y"
  sizeLabel?: string; // Default: "Size"
  colorLabel?: string; // Default: "Color"
  sizeRange?: [number, number]; // Default: [2, 12]
  colorScheme?: string; // Default: "turbo"
}
```

### BrushSelection Interface

```typescript
interface BrushSelection {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}
```

## Module Structure

```
ScatterPlot/
├── index.ts              # Main exports
├── ScatterPlot.tsx       # Main component
├── types.ts              # TypeScript interfaces
├── plot.ts               # Observable Plot utilities
├── brush.ts              # D3 brush utilities
├── legends.ts            # Legend creation utilities
└── utils.ts              # Data generation utilities
```

## Advanced Usage

### Using Individual Modules

The library exports individual utility functions for advanced use cases:

```typescript
import {
  createScatterPlot,
  createBrush,
  createSizeLegend,
  findMainSvg,
} from "./components/ScatterPlot";

// Create a plot programmatically
const plotElement = createScatterPlot(data, config);

// Add custom brush behavior
const { brush, brushLayer } = createBrush(marksGroup, circles, data, {
  extent: [
    [0, 0],
    [width, height],
  ],
  onBrush: (selection, selectedPoints) => {
    // Custom brush handler
  },
});
```

### Custom Data Generation

```typescript
import { generateRandomData } from "./components/ScatterPlot/utils";

// Generate 1000 points with seed 12345
const data = generateRandomData(1000, 12345);
```

## Interactive Features

- **Select**: Drag to create a selection box
- **Resize**: Drag the handles on edges/corners
- **Pan**: Drag the center of the selection box to move it
- **Clear**: Click outside the selection or press Escape

## Browser Support

Modern browsers with ES2020 support:

- Chrome/Edge 80+
- Firefox 74+
- Safari 14+

## License

MIT

## Contributing

Contributions are welcome! Please ensure all TypeScript types are properly defined and tests pass before submitting.
