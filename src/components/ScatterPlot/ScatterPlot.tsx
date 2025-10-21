import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import type { ScatterPlotProps } from "./types";
import {
  createScatterPlot,
  findMainSvg,
  extractScalesFromPlotElement,
  getSizeExtentAndTicks,
} from "./plot";
import { createSizeLegend } from "./legends";
import { createBrush, setBrushSelection } from "./brush";

/**
 * ScatterPlot Component
 *
 * A reusable scatter plot visualization with optional brush selection
 *
 * @param data - Array of data points with x, y, size, and color properties
 * @param config - Configuration options for the plot appearance
 * @param onSelectionChange - Callback when selection changes
 * @param enableBrush - Whether to enable brush selection (default: true)
 * @param selection - Controlled selection in data coordinates (optional)
 */
export function ScatterPlot({
  data,
  config,
  onSelectionChange,
  enableBrush = true,
  selection,
}: ScatterPlotProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedCount, setSelectedCount] = useState(0);

  // Track whether we're currently applying a programmatic selection
  // This prevents feedback loop: programmatic change → visual update → don't notify parent
  const isApplyingProgrammaticRef = useRef(false);

  // Store brush refs to allow programmatic control
  const brushRef = useRef<{
    brush: d3.BrushBehavior<unknown>;
    brushLayer: d3.Selection<SVGGElement, unknown, null, undefined>;
    circles: d3.Selection<SVGCircleElement, unknown, any, any>;
    xScale: d3.ScaleLinear<number, number>;
    yScale: d3.ScaleLinear<number, number>;
    circlePositions: Array<{ cx: number; cy: number }>;
  } | null>(null);

  // Memoize data to prevent unnecessary re-renders
  const memoizedData = useMemo(() => data, [data]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous content
    containerRef.current.innerHTML = "";

    // Create the plot
    const plotEl = createScatterPlot(memoizedData, config);
    containerRef.current.appendChild(plotEl);

    // Setup legends - Observable Plot creates a figure with SVG children
    // Structure: figure > [legend svg(s), main chart svg]
    // We need to wrap legends in a container for proper layout
    const { sizeExtent, sizeLegendData } = getSizeExtentAndTicks(memoizedData);
    const sizeLegendSvg = createSizeLegend(
      sizeLegendData,
      sizeExtent,
      config?.sizeRange || [2, 12],
      config?.sizeLabel
    );

    // Find Observable Plot's color legend and main chart
    const allSvgs = Array.from(plotEl.querySelectorAll("svg"));
    const mainChartSvg = findMainSvg(plotEl);
    const colorLegendSvg = allSvgs.find((svg) => svg !== mainChartSvg);

    if (colorLegendSvg) {
      // Create a wrapper div for both legends
      const legendWrapper = document.createElement("div");
      legendWrapper.style.display = "flex";
      legendWrapper.style.gap = "30px";
      legendWrapper.style.alignItems = "flex-start";
      legendWrapper.style.marginBottom = "10px";

      // Insert wrapper before the main chart, then move legends into it
      plotEl.insertBefore(legendWrapper, mainChartSvg);
      legendWrapper.appendChild(colorLegendSvg);
      legendWrapper.appendChild(sizeLegendSvg);
    } else {
      // No color legend, just add size legend before chart
      plotEl.insertBefore(sizeLegendSvg, mainChartSvg);
    }

    // Setup brush if enabled and we have data
    if (enableBrush && memoizedData.length > 0) {
      const svgNode = findMainSvg(plotEl);
      const svg = d3.select(svgNode);

      const allCircles = svg.selectAll<SVGCircleElement, unknown>("circle");
      if (allCircles.size() === 0) {
        console.warn("No circles found in plot - brush not initialized");
        return;
      }

      const firstCircle = allCircles.node();
      const marksGroup = firstCircle!.parentNode as SVGGElement;

      const circles = d3
        .select(marksGroup)
        .selectAll<SVGCircleElement, unknown>("circle");

      // Calculate the brush extent from circle positions
      let minX = Infinity,
        maxX = -Infinity;
      let minY = Infinity,
        maxY = -Infinity;

      circles.each(function () {
        const cx = +(this as SVGCircleElement).getAttribute("cx")!;
        const cy = +(this as SVGCircleElement).getAttribute("cy")!;
        minX = Math.min(minX, cx);
        maxX = Math.max(maxX, cx);
        minY = Math.min(minY, cy);
        maxY = Math.max(maxY, cy);
      });

      // Add padding to allow selection beyond the outermost points
      const padding = 20;
      const extent: [[number, number], [number, number]] = [
        [minX - padding, minY - padding],
        [maxX + padding, maxY + padding],
      ];

      // Extract scales from Observable Plot
      const scales = extractScalesFromPlotElement(plotEl, circles);

      if (!scales) {
        console.error("Failed to extract scales - brush not initialized");
        return;
      }

      const { xScale, yScale } = scales;

      const { brush, brushLayer, circlePositions } = createBrush(
        marksGroup,
        circles,
        memoizedData,
        {
          extent,
          xScale,
          yScale,
          onBrush: (selection, selectedPoints) => {
            setSelectedCount(selectedPoints.length);

            // Only notify parent if this is a user-initiated change
            // (not a programmatic selection being applied)
            if (!isApplyingProgrammaticRef.current) {
              onSelectionChange?.(selectedPoints, selection);
            }
          },
        }
      );

      brushRef.current = {
        brush,
        brushLayer,
        xScale,
        yScale,
        circles,
        circlePositions,
      };

      // Setup Escape key to clear selection
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape" && brushRef.current) {
          const { brush, brushLayer } = brushRef.current;
          brush.move(brushLayer, null);
          setSelectedCount(0);
          onSelectionChange?.([], null);
        }
      };

      document.addEventListener("keydown", handleKeyDown);

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [memoizedData, config, enableBrush, onSelectionChange]);

  // Effect to handle controlled selection changes from parent
  useEffect(() => {
    if (!enableBrush || !brushRef.current) return;

    const { brush, brushLayer, xScale, yScale, circles, circlePositions } =
      brushRef.current;

    // Set flag to indicate we're applying a programmatic selection
    // This prevents the onBrush callback from notifying parent (avoiding feedback loop)
    isApplyingProgrammaticRef.current = true;

    try {
      // Apply the selection (this will trigger brush events but won't call parent callback)
      setBrushSelection(
        brushLayer,
        brush,
        selection ?? null,
        xScale,
        yScale,
        circles,
        circlePositions
      );
    } finally {
      // Reset flag after applying
      isApplyingProgrammaticRef.current = false;
    }
  }, [selection, enableBrush]);

  return (
    <div>
      <div ref={containerRef} className="plot-container" />
      {enableBrush && (
        <div style={{ marginTop: 8, fontSize: 12, color: "#555" }}>
          Selected: {selectedCount}
        </div>
      )}
    </div>
  );
}
