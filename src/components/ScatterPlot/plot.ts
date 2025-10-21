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

/**
 * Extract scales directly from Observable Plot's native scale API
 * This uses Plot's actual internal scales for accurate coordinate transformations
 *
 * @param plotEl - The plot HTML element (has plot.scale() method attached)
 * @param circles - D3 selection of circle elements to analyze for pixel extent
 * @returns D3 linear scales for x and y axes, or null if extraction fails
 */
export function extractScalesFromPlotElement(
  plotEl: HTMLElement,
  circles: d3.Selection<SVGCircleElement, unknown, any, any>
): {
  xScale: d3.ScaleLinear<number, number>;
  yScale: d3.ScaleLinear<number, number>;
} | null {
  const plot = plotEl as any;

  // Check if Observable Plot's scale API is available
  if (!plot.scale) {
    console.warn("Observable Plot scale API not available");
    return null;
  }

  // Check if we have circles to work with
  if (circles.size() === 0) {
    console.warn("No circles found - cannot extract scales");
    return null;
  }

  try {
    // Get Observable Plot's native scales
    const xScalePlot = plot.scale("x");
    const yScalePlot = plot.scale("y");

    if (!xScalePlot || !yScalePlot) {
      console.warn("Could not get x or y scale from Observable Plot");
      return null;
    }

    // Find the pixel extent from rendered circles
    let minCx = Infinity,
      maxCx = -Infinity;
    let minCy = Infinity,
      maxCy = -Infinity;

    circles.each(function () {
      const cx = +this.getAttribute("cx")!;
      const cy = +this.getAttribute("cy")!;
      minCx = Math.min(minCx, cx);
      maxCx = Math.max(maxCx, cx);
      minCy = Math.min(minCy, cy);
      maxCy = Math.max(maxCy, cy);
    });

    // Use Plot's invert to find data values at these pixel positions
    const xDomain = [xScalePlot.invert(minCx), xScalePlot.invert(maxCx)];
    const yDomain = [yScalePlot.invert(maxCy), yScalePlot.invert(minCy)]; // Inverted for SVG coords

    // Create D3 scales that match Observable Plot's transformation
    const xScale = d3.scaleLinear().domain(xDomain).range([minCx, maxCx]);

    const yScale = d3.scaleLinear().domain(yDomain).range([maxCy, minCy]); // Inverted range for SVG

    console.log("✓ Using Observable Plot native scales");
    console.log("  X domain:", xDomain, "→ range:", [minCx, maxCx]);
    console.log("  Y domain:", yDomain, "→ range:", [maxCy, minCy]);

    return { xScale, yScale };
  } catch (error) {
    console.error("Error extracting scales from Observable Plot:", error);
    return null;
  }
}
