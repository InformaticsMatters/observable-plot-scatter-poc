import * as d3 from "d3";
import type { Point, BrushSelection } from "./types";

/**
 * Generates random scatter plot data
 *
 * @param n - Number of points to generate
 * @param seed - Random seed for reproducibility
 * @returns Array of random points
 */
export function generateRandomData(
  n: number = 600,
  seed: number = 42
): Point[] {
  const data: Point[] = [];
  const random = d3.randomNormal.source(d3.randomLcg(seed));

  for (let i = 0; i < n; i++) {
    data.push({
      x: random(50, 15)(),
      y: random(50, 15)(),
      size: random(30, 10)(),
      color: random(10, 50)(),
    });
  }

  return data;
}

/**
 * Checks if a point (in SVG pixel coordinates) is within a brush selection
 *
 * @param cx - X coordinate in SVG pixels
 * @param cy - Y coordinate in SVG pixels
 * @param selection - Brush selection bounds
 * @returns true if the point is inside the selection
 */
export function isPointInSelection(
  cx: number,
  cy: number,
  selection: BrushSelection
): boolean {
  const { x0, y0, x1, y1 } = selection;
  return cx >= x0 && cx <= x1 && cy >= y0 && cy <= y1;
}
