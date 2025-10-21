import { useMemo } from "react";
import { ScatterPlot } from "./ScatterPlot";
import { generateRandomData } from "./ScatterPlot/utils";
import type { Point, BrushSelection } from "./ScatterPlot";

/**
 * PlotScatterBrush - Demo component using the reusable ScatterPlot
 *
 * This component demonstrates how to use the ScatterPlot component library
 */
export function PlotScatterBrush() {
  const data = useMemo(() => generateRandomData(800), []);

  const handleSelectionChange = (
    selectedPoints: Point[],
    selection: BrushSelection | null
  ) => {
    // You can handle selection changes here
    console.log(`Selected ${selectedPoints.length} points`, selection);
  };

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
      onSelectionChange={handleSelectionChange}
    />
  );
}
