import * as d3 from "d3";
import type { Point, BrushSelection } from "./types";

export interface BrushConfig {
  extent: [[number, number], [number, number]];
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
    onBrush,
    selectedOpacity = 0.7,
    unselectedOpacity = 0.15,
    selectionColor = "rgba(80, 120, 255, 0.14)",
    selectionStroke = "#5569ff",
  } = config;

  // Define brush
  const brush = d3
    .brush()
    .extent(extent)
    .on("start brush", (event: d3.D3BrushEvent<unknown>) => {
      const sel = event.selection as
        | [[number, number], [number, number]]
        | null;

      if (sel) {
        const [[x0, y0], [x1, y1]] = sel;
        const selectedPoints: Point[] = [];

        circles.each(function (_d, i) {
          const el = this as SVGCircleElement;
          const cx = +el.getAttribute("cx")!;
          const cy = +el.getAttribute("cy")!;
          const inside = x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;

          if (inside) {
            selectedPoints.push(data[i]);
            el.style.opacity = String(selectedOpacity);
          } else {
            el.style.opacity = String(unselectedOpacity);
          }
        });

        onBrush?.({ x0, y0, x1, y1 }, selectedPoints);
      } else {
        circles.each(function () {
          (this as SVGCircleElement).style.opacity = String(selectedOpacity);
        });
        onBrush?.(null, []);
      }
    })
    .on("end", (event: d3.D3BrushEvent<unknown>) => {
      if (!event.selection) {
        circles.each(function () {
          (this as SVGCircleElement).style.opacity = String(selectedOpacity);
        });
        onBrush?.(null, []);
      }
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

  return { brush, brushLayer };
}

/**
 * Clears the brush selection
 */
export function clearBrushSelection(
  brushLayer: d3.Selection<SVGGElement, unknown, null, undefined>,
  brush: d3.BrushBehavior<unknown>,
  circles: d3.Selection<SVGCircleElement, unknown, any, any>,
  opacity: number = 0.7
) {
  brushLayer.call(brush.move as any, null);
  circles.each(function () {
    (this as SVGCircleElement).style.opacity = String(opacity);
  });
}
