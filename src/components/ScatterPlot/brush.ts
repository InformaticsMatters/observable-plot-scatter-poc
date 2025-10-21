import * as d3 from "d3";
import type { Point, BrushSelection } from "./types";

export interface BrushConfig {
  extent: [[number, number], [number, number]];
  xScale: d3.ScaleLinear<number, number>;
  yScale: d3.ScaleLinear<number, number>;
  onBrush?: (selection: BrushSelection | null, selectedPoints: Point[]) => void;
  selectedOpacity?: number;
  unselectedOpacity?: number;
  selectionColor?: string;
  selectionStroke?: string;
}

/**
 * Creates and configures a D3 brush for point selection
 */
export function createBrush(
  marksGroup: SVGGElement,
  circles: d3.Selection<SVGCircleElement, unknown, any, any>,
  data: Point[],
  config: BrushConfig
) {
  const {
    extent,
    xScale,
    yScale,
    onBrush,
    selectionColor = "rgba(80, 120, 255, 0.14)",
    selectionStroke = "#5569ff",
  } = config;

  // Cache circle positions for faster lookups during brushing
  const circlePositions: Array<{ cx: number; cy: number }> = [];
  circles.each(function () {
    const el = this as SVGCircleElement;
    circlePositions.push({
      cx: +el.getAttribute("cx")!,
      cy: +el.getAttribute("cy")!,
    });
  });

  // Directly manipulate opacity attribute for maximum performance
  // classList operations can be slow with many elements
  const updateCircleOpacities = (
    sel: [[number, number], [number, number]] | null
  ) => {
    if (sel) {
      const [[svgX0, svgY0], [svgX1, svgY1]] = sel;

      // Direct attribute manipulation is faster than classList for bulk operations
      const nodes = circles.nodes();
      for (let i = 0; i < nodes.length; i++) {
        const { cx, cy } = circlePositions[i];
        const inside = svgX0 <= cx && cx <= svgX1 && svgY0 <= cy && cy <= svgY1;
        // Direct DOM manipulation is fastest
        nodes[i].setAttribute("opacity", inside ? "0.7" : "0.15");
      }
    } else {
      // Fast path for clearing selection
      const nodes = circles.nodes();
      for (let i = 0; i < nodes.length; i++) {
        nodes[i].setAttribute("opacity", "0.7");
      }
    }
  };

  // Helper function to calculate selected points and convert coordinates
  const calculateSelection = (
    sel: [[number, number], [number, number]] | null
  ): {
    dataSelection: BrushSelection | null;
    selectedPoints: Point[];
  } => {
    if (!sel) {
      return { dataSelection: null, selectedPoints: [] };
    }

    const [[svgX0, svgY0], [svgX1, svgY1]] = sel;
    const selectedPoints: Point[] = [];

    // Use cached positions for faster calculation
    for (let i = 0; i < circlePositions.length; i++) {
      const { cx, cy } = circlePositions[i];
      const inside = svgX0 <= cx && cx <= svgX1 && svgY0 <= cy && cy <= svgY1;
      if (inside) {
        selectedPoints.push(data[i]);
      }
    }

    // Convert SVG pixel coordinates to data coordinates
    const dataSelection: BrushSelection = {
      x0: xScale.invert(svgX0),
      y0: yScale.invert(svgY0),
      x1: xScale.invert(svgX1),
      y1: yScale.invert(svgY1),
    };

    return { dataSelection, selectedPoints };
  };

  // Define brush
  const brush = d3
    .brush()
    .extent(extent)
    .on("start", () => {
      // Brush interaction starting
    })
    .on("brush", (event: d3.D3BrushEvent<unknown>) => {
      // During brushing, update visual feedback immediately
      const sel = event.selection as
        | [[number, number], [number, number]]
        | null;
      updateCircleOpacities(sel);
    })
    .on("end", (event: d3.D3BrushEvent<unknown>) => {
      // On end, calculate selection and notify parent
      const sel = event.selection as
        | [[number, number], [number, number]]
        | null;
      updateCircleOpacities(sel);

      const { dataSelection, selectedPoints } = calculateSelection(sel);
      onBrush?.(dataSelection, selectedPoints);
    });

  // Add brush layer
  const marksSelection = d3.select(marksGroup);
  const brushLayer = marksSelection
    .append("g")
    .attr("class", "brush")
    .style("cursor", "crosshair")
    .call(brush as any);

  // Configure brush appearance
  (brushLayer as any).raise?.();
  brushLayer
    .select(".overlay")
    .style("pointer-events", "all")
    .style("cursor", "crosshair");

  brushLayer
    .select(".selection")
    .style("pointer-events", "all")
    .style("cursor", "move")
    .style("fill", selectionColor)
    .style("stroke", selectionStroke)
    .style("stroke-width", "2px");

  return { brush, brushLayer, circlePositions };
}

/**
 * Clears the brush selection
 */
export function clearBrushSelection(
  brushLayer: d3.Selection<SVGGElement, unknown, null, undefined>,
  brush: d3.BrushBehavior<unknown>,
  circles: d3.Selection<SVGCircleElement, unknown, any, any>
) {
  brushLayer.call(brush.move as any, null);
  const nodes = circles.nodes();
  for (let i = 0; i < nodes.length; i++) {
    nodes[i].setAttribute("opacity", "0.7");
  }
}

/**
 * Programmatically sets the brush selection
 * @param brushLayer - The D3 selection of the brush layer
 * @param brush - The D3 brush behavior
 * @param selection - The selection bounds in data coordinates, or null to clear
 * @param xScale - Scale function to convert data X to SVG pixels
 * @param yScale - Scale function to convert data Y to SVG pixels
 * @param circles - The circle elements to update visually
 * @param circlePositions - Cached positions for performance
 */
export function setBrushSelection(
  brushLayer: d3.Selection<SVGGElement, unknown, null, undefined>,
  brush: d3.BrushBehavior<unknown>,
  selection: BrushSelection | null,
  xScale?: d3.ScaleLinear<number, number>,
  yScale?: d3.ScaleLinear<number, number>,
  circles?: d3.Selection<SVGCircleElement, unknown, any, any>,
  circlePositions?: Array<{ cx: number; cy: number }>
) {
  if (selection === null) {
    brushLayer.call(brush.move as any, null);
    // Manually reset circle opacities since move doesn't trigger events
    if (circles) {
      const nodes = circles.nodes();
      for (let i = 0; i < nodes.length; i++) {
        nodes[i].setAttribute("opacity", "0.7");
      }
    }
  } else {
    if (!xScale || !yScale) {
      console.warn("Scales required to set brush selection");
      return;
    }

    // Convert data coordinates to SVG pixel coordinates
    const { x0, y0, x1, y1 } = selection;
    const svgX0 = xScale(x0);
    const svgY0 = yScale(y0);
    const svgX1 = xScale(x1);
    const svgY1 = yScale(y1);

    // Ensure proper ordering (D3 brush expects top-left to bottom-right)
    const minX = Math.min(svgX0, svgX1);
    const maxX = Math.max(svgX0, svgX1);
    const minY = Math.min(svgY0, svgY1);
    const maxY = Math.max(svgY0, svgY1);

    brushLayer.call(brush.move as any, [
      [minX, minY],
      [maxX, maxY],
    ]);

    // Manually update circle opacities since move doesn't always trigger events
    if (circles && circlePositions) {
      const nodes = circles.nodes();
      for (let i = 0; i < nodes.length; i++) {
        const { cx, cy } = circlePositions[i];
        const inside = minX <= cx && cx <= maxX && minY <= cy && cy <= maxY;
        nodes[i].setAttribute("opacity", inside ? "0.7" : "0.15");
      }
    }
  }
}
