import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import type { ScatterPlotProps } from "./types";
import { createScatterPlot, findMainSvg, getSizeExtentAndTicks } from "./plot";
import { createLegendWrapper, createSizeLegend } from "./legends";
import { createBrush, clearBrushSelection } from "./brush";

/**
 * ScatterPlot Component
 *
 * A reusable scatter plot visualization with optional brush selection
 *
 * @param data - Array of data points with x, y, size, and color properties
 * @param config - Configuration options for the plot appearance
 * @param onSelectionChange - Callback when selection changes
 * @param enableBrush - Whether to enable brush selection (default: true)
 * @param showLegends - Whether to show legends (default: true)
 */
export function ScatterPlot({
  data,
  config,
  onSelectionChange,
  enableBrush = true,
  showLegends = true,
}: ScatterPlotProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedCount, setSelectedCount] = useState(0);

  // Memoize data to prevent unnecessary re-renders
  const memoizedData = useMemo(() => data, [data]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create the plot
    const plotEl = createScatterPlot(memoizedData, config);

    // Mount the plot
    containerRef.current.innerHTML = "";
    containerRef.current.append(plotEl);

    // Setup legends if enabled
    if (showLegends) {
      const allLegends = Array.from(
        plotEl.querySelectorAll(
          ".plot-legend, .plot-ramp, [aria-label*='legend']"
        )
      );

      const legendWrapper = createLegendWrapper();

      // Move existing legends to wrapper
      allLegends.forEach((legend) => {
        const wrapper = document.createElement("div");
        wrapper.append(legend);
        legendWrapper.append(wrapper);
      });

      // Create size legend
      const { sizeExtent, sizeLegendData } =
        getSizeExtentAndTicks(memoizedData);
      const sizeLegendSvg = createSizeLegend(
        sizeLegendData,
        sizeExtent,
        config?.sizeRange || [2, 12],
        config?.sizeLabel
      );

      const sizeLegendWrapper = document.createElement("div");
      sizeLegendWrapper.append(sizeLegendSvg);
      legendWrapper.append(sizeLegendWrapper);

      containerRef.current.insertBefore(
        legendWrapper,
        containerRef.current.firstChild
      );
    }

    // Setup brush if enabled
    if (enableBrush) {
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

      // Calculate the actual extent from the circle positions
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

      // Add some padding to allow selection beyond the outermost points
      const padding = 20;
      const extent: [[number, number], [number, number]] = [
        [minX - padding, minY - padding],
        [maxX + padding, maxY + padding],
      ];

      const { brush, brushLayer } = createBrush(
        marksGroup,
        circles,
        memoizedData,
        {
          extent,
          onBrush: (selection, selectedPoints) => {
            setSelectedCount(selectedPoints.length);
            onSelectionChange?.(selectedPoints, selection);
          },
        }
      );

      // Add keyboard listener for Escape key
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          clearBrushSelection(brushLayer, brush, circles);
          setSelectedCount(0);
          onSelectionChange?.([], null);
        }
      };

      window.addEventListener("keydown", handleKeyDown);

      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        d3.select(plotEl).remove();
      };
    }

    return () => {
      d3.select(plotEl).remove();
    };
  }, [memoizedData, config, enableBrush, showLegends, onSelectionChange]);

  return (
    <div>
      <figure ref={containerRef} className="plot" />
      {enableBrush && (
        <div style={{ marginTop: 8, fontSize: 12, color: "#555" }}>
          Selected: {selectedCount}
        </div>
      )}
    </div>
  );
}
