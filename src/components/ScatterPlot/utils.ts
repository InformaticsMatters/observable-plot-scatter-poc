import * as d3 from "d3";
import type { Point } from "./types";

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
      size: random(10, 3)(),
      color: random(50, 20)(),
    });
  }

  return data;
}
