/**
 * Debug utilities for coordinate system testing
 */

import type { Point } from "./types";
import * as d3 from "d3";

export function debugScales(
  circles: d3.Selection<SVGCircleElement, unknown, any, any>,
  data: Point[],
  xScale: d3.ScaleLinear<number, number>,
  yScale: d3.ScaleLinear<number, number>
) {
  console.group("🔍 Scale Debug Info");

  // Test a few points
  const testIndices = [0, Math.floor(data.length / 2), data.length - 1];

  testIndices.forEach((i) => {
    const point = data[i];
    const circle = circles.filter((_d, idx) => idx === i).node();
    if (circle) {
      const cx = +circle.getAttribute("cx")!;
      const cy = +circle.getAttribute("cy")!;

      const predictedCx = xScale(point.x);
      const predictedCy = yScale(point.y);

      const invertedX = xScale.invert(cx);
      const invertedY = yScale.invert(cy);

      console.log(`Point ${i}:`);
      console.log(`  Data: (${point.x.toFixed(2)}, ${point.y.toFixed(2)})`);
      console.log(`  Actual SVG: (${cx.toFixed(2)}, ${cy.toFixed(2)})`);
      console.log(
        `  Predicted SVG: (${predictedCx.toFixed(2)}, ${predictedCy.toFixed(
          2
        )})`
      );
      console.log(
        `  Error: (${Math.abs(cx - predictedCx).toFixed(2)}, ${Math.abs(
          cy - predictedCy
        ).toFixed(2)})`
      );
      console.log(
        `  Inverted: (${invertedX.toFixed(2)}, ${invertedY.toFixed(2)})`
      );
    }
  });

  console.log("\nScale Domains and Ranges:");
  console.log(`  X: ${xScale.domain()} → ${xScale.range()}`);
  console.log(`  Y: ${yScale.domain()} → ${yScale.range()}`);

  console.groupEnd();
}
