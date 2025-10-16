import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import type { Point, ScatterPlotConfig } from "./types";

const DEFAULT_CONFIG: Required<ScatterPlotConfig> = {
  height: 600,
  width: 800,
  margin: 60,
  xLabel: "Variable X",
  yLabel: "Variable Y",
  sizeLabel: "Size",
  colorLabel: "Color",
  sizeRange: [2, 12],
  colorScheme: "turbo",
};

/**
 * Creates an Observable Plot scatter plot
 */
export function createScatterPlot(
  data: Point[],
  config: ScatterPlotConfig = {}
): HTMLElement {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  return Plot.plot({
    height: cfg.height,
    width: cfg.width,
    grid: true,
    margin: cfg.margin,
    x: { label: cfg.xLabel },
    y: { label: cfg.yLabel },
    r: {
      label: cfg.sizeLabel,
      range: cfg.sizeRange,
    },
    color: {
      label: cfg.colorLabel,
      scheme: cfg.colorScheme as any,
      legend: true,
      tickFormat: (d: number) => d.toFixed(0),
    },
    marks: [
      Plot.dot(data, {
        x: "x",
        y: "y",
        r: "size",
        fill: "color",
        stroke: "color",
        strokeWidth: 0.5,
        fillOpacity: 0.7,
      }),
    ],
  }) as unknown as HTMLElement;
}

/**
 * Finds the main SVG element in a Plot (avoiding legend swatches)
 */
export function findMainSvg(plotElement: HTMLElement): SVGSVGElement {
  if ((plotElement as any).tagName?.toLowerCase?.() === "svg") {
    return plotElement as unknown as SVGSVGElement;
  }

  // Get all SVGs and find the largest one (main plot, not legend)
  const allSvgs = Array.from(
    plotElement.querySelectorAll("svg")
  ) as SVGSVGElement[];

  return allSvgs.reduce((largest, current) => {
    const largestSize =
      (largest.width.baseVal?.value || 0) *
      (largest.height.baseVal?.value || 0);
    const currentSize =
      (current.width.baseVal?.value || 0) *
      (current.height.baseVal?.value || 0);
    return currentSize > largestSize ? current : largest;
  }, allSvgs[0]);
}

/**
 * Gets size extent and legend values from data
 */
export function getSizeExtentAndTicks(data: Point[], numTicks: number = 5) {
  const sizeExtent = d3.extent(data, (d) => d.size) as [number, number];
  const sizeLegendData = d3.ticks(sizeExtent[0], sizeExtent[1], numTicks);
  return { sizeExtent, sizeLegendData };
}

/**
 * Gets the plot area dimensions from the SVG structure
 * Observable Plot uses a transform on the marks group to position the plot area
 */
export function getPlotAreaDimensions(config?: ScatterPlotConfig): {
  width: number;
  height: number;
} {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  // Observable Plot creates a plot area with dimensions based on the full size minus margins
  const plotWidth = cfg.width - cfg.margin * 2;
  const plotHeight = cfg.height - cfg.margin * 2;

  return {
    width: plotWidth,
    height: plotHeight,
  };
}
