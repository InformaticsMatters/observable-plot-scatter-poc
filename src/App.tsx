import { useMemo, useState } from "react";
import {
  ScatterPlot,
  BrushSelection,
  Point,
  generateRandomData,
} from "./components/ScatterPlot";

export default function App() {
  const data = useMemo(() => generateRandomData(800), []);
  const [selection, setSelection] = useState<BrushSelection | null>(null);
  const [selectedPoints, setSelectedPoints] = useState<Point[]>([]);

  const handleSelectionChange = (
    points: Point[],
    newSelection: BrushSelection | null
  ) => {
    setSelectedPoints(points);
    setSelection(newSelection);
  };

  // Programmatic selection using data coordinates
  const selectCenterRegion = () => {
    // Select center region (data coordinates around mean ~50)
    setSelection({ x0: 40, y0: 40, x1: 60, y1: 60 });
  };

  const selectLowRegion = () => {
    // Select lower-left region
    setSelection({ x0: 20, y0: 20, x1: 45, y1: 45 });
  };

  const clearSelection = () => {
    setSelection(null);
  };

  return (
    <div className="app">
      <h1>Observable Plot: 4D Scatter with Brush</h1>
      <p>
        Each point has 4 random variables mapped to: <strong>X position</strong>
        , <strong>Y position</strong>, <strong>Size</strong>, and{" "}
        <strong>Color</strong>.
      </p>
      <p>
        <em>Drag to select points. Non-selected points become translucent.</em>
      </p>

      <div style={{ marginBottom: 16 }}>
        <strong>Programmatic Selection:</strong>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button onClick={selectCenterRegion}>
            Select Center (x:40-60, y:40-60)
          </button>
          <button onClick={selectLowRegion}>
            Select Low Region (x:20-45, y:20-45)
          </button>
          <button onClick={clearSelection}>Clear Selection</button>
        </div>
      </div>

      <div className="chart-container">
        <ScatterPlot
          data={data}
          selection={selection}
          onSelectionChange={handleSelectionChange}
          enableBrush={true}
        />
      </div>

      {selectedPoints.length > 0 && (
        <div
          style={{
            marginTop: 16,
            padding: 16,
            background: "#f0f7ff",
            borderRadius: 8,
            border: "1px solid #4a90e2",
          }}
        >
          <h3 style={{ marginTop: 0 }}>Selection Info</h3>
          <p>
            <strong>Selected Points:</strong> {selectedPoints.length}
          </p>
          {selection && (
            <p>
              <strong>Data Coordinates:</strong> ({selection.x0.toFixed(2)},{" "}
              {selection.y0.toFixed(2)}) to ({selection.x1.toFixed(2)},{" "}
              {selection.y1.toFixed(2)})
            </p>
          )}
        </div>
      )}
    </div>
  );
}
