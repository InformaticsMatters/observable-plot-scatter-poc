/**
 * Example: Advanced Usage of ScatterPlot Component
 *
 * This file demonstrates various ways to use the ScatterPlot component library
 */

import { useMemo, useState } from "react";
import { ScatterPlot } from ".";
import { generateRandomData } from "./utils";
import type { Point, BrushSelection } from "./types";

/**
 * Example 1: Basic Scatter Plot
 */
export function BasicExample() {
  const data = useMemo(() => generateRandomData(500), []);

  return <ScatterPlot data={data} />;
}

/**
 * Example 2: Custom Configuration
 */
export function CustomConfigExample() {
  const data = useMemo(() => generateRandomData(1000, 999), []);

  return (
    <ScatterPlot
      data={data}
      config={{
        height: 500,
        width: 700,
        xLabel: "Temperature (°C)",
        yLabel: "Pressure (kPa)",
        sizeLabel: "Flow Rate",
        colorLabel: "Viscosity",
        colorScheme: "viridis",
        sizeRange: [1, 15],
      }}
    />
  );
}

/**
 * Example 3: With Selection Handling
 */
export function SelectionHandlingExample() {
  const data = useMemo(() => generateRandomData(800), []);
  const [selectedPoints, setSelectedPoints] = useState<Point[]>([]);
  const [selectionBounds, setSelectionBounds] = useState<BrushSelection | null>(
    null
  );

  const handleSelectionChange = (
    points: Point[],
    selection: BrushSelection | null
  ) => {
    setSelectedPoints(points);
    setSelectionBounds(selection);
  };

  return (
    <div>
      <ScatterPlot
        data={data}
        onSelectionChange={handleSelectionChange}
        enableBrush={true}
      />

      {selectedPoints.length > 0 && (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            background: "#f5f5f5",
            borderRadius: 4,
          }}
        >
          <h4>Selection Summary</h4>
          <p>Count: {selectedPoints.length}</p>
          {selectionBounds && (
            <p>
              Bounds: ({selectionBounds.x0.toFixed(1)},{" "}
              {selectionBounds.y0.toFixed(1)}) to (
              {selectionBounds.x1.toFixed(1)}, {selectionBounds.y1.toFixed(1)})
            </p>
          )}
          <details>
            <summary>Show selected points</summary>
            <pre style={{ fontSize: 11, maxHeight: 200, overflow: "auto" }}>
              {JSON.stringify(selectedPoints.slice(0, 10), null, 2)}
              {selectedPoints.length > 10 && "\n... and more"}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}

/**
 * Example 4: Without Brush
 */
export function NoBrushExample() {
  const data = useMemo(() => generateRandomData(600), []);

  return (
    <ScatterPlot
      data={data}
      enableBrush={false}
      config={{
        colorScheme: "cool",
      }}
    />
  );
}

/**
 * Example 5: Without Legends
 */
export function NoLegendsExample() {
  const data = useMemo(() => generateRandomData(400), []);

  return <ScatterPlot data={data} showLegends={false} />;
}

/**
 * Example 6: Custom Data
 */
export function CustomDataExample() {
  // Create custom data instead of using generateRandomData
  const data: Point[] = useMemo(() => {
    return Array.from({ length: 300 }, (_, i) => ({
      x: Math.cos(i / 10) * 50 + 50,
      y: Math.sin(i / 10) * 50 + 50,
      size: Math.abs(Math.sin(i / 5)) * 15 + 5,
      color: i % 100,
      id: i, // Additional custom property
    }));
  }, []);

  return (
    <ScatterPlot
      data={data}
      config={{
        xLabel: "X Position",
        yLabel: "Y Position",
        colorScheme: "rainbow",
      }}
    />
  );
}

/**
 * Example 7: Multiple Plots
 */
export function MultiplePlotsExample() {
  const data1 = useMemo(() => generateRandomData(400, 1), []);
  const data2 = useMemo(() => generateRandomData(400, 2), []);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      <div>
        <h3>Dataset A</h3>
        <ScatterPlot
          data={data1}
          config={{
            height: 400,
            width: 600,
            colorScheme: "blues",
          }}
        />
      </div>
      <div>
        <h3>Dataset B</h3>
        <ScatterPlot
          data={data2}
          config={{
            height: 400,
            width: 600,
            colorScheme: "reds",
          }}
        />
      </div>
    </div>
  );
}
