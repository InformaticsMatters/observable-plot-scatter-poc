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
 * Example 4: Controlled Selection
 * Demonstrates programmatic control of the brush selection
 */
export function ControlledSelectionExample() {
  const data = useMemo(() => generateRandomData(800), []);
  const [selectedPoints, setSelectedPoints] = useState<Point[]>([]);
  const [selection, setSelection] = useState<BrushSelection | null>(null);

  const handleSelectionChange = (
    points: Point[],
    newSelection: BrushSelection | null
  ) => {
    setSelectedPoints(points);
    setSelection(newSelection);
  };

  // Programmatically set selection to predefined regions using DATA coordinates
  // The data is generated with mean ~50 and std dev ~15, so typical range is 20-80
  const selectLowXLowY = () => {
    // Select bottom-left quadrant in data space
    setSelection({ x0: 20, y0: 20, x1: 50, y1: 50 });
  };

  const selectHighXHighY = () => {
    // Select top-right quadrant in data space
    setSelection({ x0: 50, y0: 50, x1: 80, y1: 80 });
  };

  const selectCenter = () => {
    // Select center region in data space
    setSelection({ x0: 40, y0: 40, x1: 60, y1: 60 });
  };

  const clearSelection = () => {
    setSelection(null);
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h4>Programmatic Selection Controls</h4>
        <p style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>
          These buttons demonstrate controlled selection using{" "}
          <strong>data coordinates</strong>. The selection automatically
          converts between data space and SVG pixel space.
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={selectLowXLowY}>Select Low X/Y Region</button>
          <button onClick={selectCenter}>Select Center Region</button>
          <button onClick={selectHighXHighY}>Select High X/Y Region</button>
          <button onClick={clearSelection}>Clear Selection</button>
        </div>
      </div>

      <ScatterPlot
        data={data}
        selection={selection}
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
          {selection && (
            <p>
              Data Bounds: ({selection.x0.toFixed(2)}, {selection.y0.toFixed(2)}
              ) to ({selection.x1.toFixed(2)}, {selection.y1.toFixed(2)})
            </p>
          )}
          <details>
            <summary>Show first 5 selected points</summary>
            <pre style={{ fontSize: 11, maxHeight: 200, overflow: "auto" }}>
              {JSON.stringify(
                selectedPoints.slice(0, 5).map((p) => ({
                  x: p.x.toFixed(2),
                  y: p.y.toFixed(2),
                  size: p.size.toFixed(2),
                  color: p.color.toFixed(2),
                })),
                null,
                2
              )}
              {selectedPoints.length > 5 && "\n... and more"}
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
 * Example 5: Simple Plot (Observable Plot handles legends internally)
 */
export function SimpleExample() {
  const data = useMemo(() => generateRandomData(400), []);

  return <ScatterPlot data={data} />;
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
