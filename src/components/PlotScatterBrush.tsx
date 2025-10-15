import { useEffect, useMemo, useRef, useState } from "react";
import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

// Types for our random data - 4 numeric attributes
type Point = {
  x: number;
  y: number;
  size: number;
  color: number;
};

// Generate random data with 4 independent variables
function generateData(n = 600): Point[] {
  const data: Point[] = [];
  const random = d3.randomNormal.source(d3.randomLcg(42));

  for (let i = 0; i < n; i++) {
    data.push({
      x: random(50, 15)(), // mean 50, std 15
      y: random(50, 15)(), // mean 50, std 15
      size: random(10, 3)(), // mean 10, std 3
      color: random(50, 20)(), // mean 50, std 20
    });
  }
  return data;
}

export function PlotScatterBrush() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedCount, setSelectedCount] = useState(0);

  const data = useMemo(() => generateData(800), []);

  useEffect(() => {
    if (!containerRef.current) return;

    // Build Plot SVG with 4 visual channels and legends
    const MARGIN = 60;

    const plotEl = Plot.plot({
      height: 600,
      width: 800,
      grid: true,
      margin: MARGIN,
      x: { label: "Variable X" },
      y: { label: "Variable Y" },
      r: {
        label: "Size",
        range: [2, 12],
      },
      color: {
        label: "Color",
        scheme: "turbo",
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

    // Mount the plot first
    containerRef.current.innerHTML = "";
    containerRef.current.append(plotEl);

    // Now find all legends in the plot and reorganize them
    // Observable Plot renders legends inside the figure element
    const allLegends = Array.from(
      plotEl.querySelectorAll(
        ".plot-legend, .plot-ramp, [aria-label*='legend']"
      )
    );

    // Create a wrapper for legends
    const legendWrapper = document.createElement("div");
    legendWrapper.style.display = "flex";
    legendWrapper.style.flexDirection = "row";
    legendWrapper.style.gap = "30px";
    legendWrapper.style.alignItems = "center";
    legendWrapper.style.marginBottom = "10px";
    legendWrapper.style.flexWrap = "nowrap";

    // Move existing legends to wrapper
    allLegends.forEach((legend) => {
      const wrapper = document.createElement("div");
      wrapper.append(legend);
      legendWrapper.append(wrapper);
    });

    // Create a custom size legend
    const sizeExtent = d3.extent(data, (d) => d.size) as [number, number];
    const sizeLegendData = d3.ticks(sizeExtent[0], sizeExtent[1], 5);

    // Create size legend SVG
    const sizeLegendSvg = d3
      .create("svg")
      .attr("width", 180)
      .attr("height", 40)
      .style("font", "10px system-ui, sans-serif")
      .style("display", "block");

    // Add title
    sizeLegendSvg
      .append("text")
      .attr("x", 0)
      .attr("y", 10)
      .style("font-weight", "bold")
      .text("Size");

    // Add circles and labels
    const rScale = d3.scaleLinear().domain(sizeExtent).range([2, 12]);

    let xOffset = 10;
    sizeLegendData.forEach((val) => {
      const r = rScale(val);
      sizeLegendSvg
        .append("circle")
        .attr("cx", xOffset + r)
        .attr("cy", 28)
        .attr("r", r)
        .attr("fill", "#888")
        .attr("stroke", "#555")
        .attr("stroke-width", 0.5)
        .attr("fill-opacity", 0.7);

      sizeLegendSvg
        .append("text")
        .attr("x", xOffset + r)
        .attr("y", 15)
        .attr("text-anchor", "middle")
        .style("font-size", "9px")
        .text(val.toFixed(0));

      xOffset += r * 2 + 8;
    });

    // Add size legend to wrapper
    const sizeLegendWrapper = document.createElement("div");
    sizeLegendWrapper.append(sizeLegendSvg.node()!);
    legendWrapper.append(sizeLegendWrapper);

    // Insert legend wrapper at the beginning
    containerRef.current.insertBefore(
      legendWrapper,
      containerRef.current.firstChild
    );

    // Grab the MAIN SVG (not the legend swatches)
    // Plot wraps everything in a <figure>, and the main chart is the largest SVG
    let svgNode: SVGSVGElement;
    if ((plotEl as any).tagName?.toLowerCase?.() === "svg") {
      svgNode = plotEl as unknown as SVGSVGElement;
    } else {
      // Get all SVGs and find the largest one (main plot, not legend)
      const allSvgs = Array.from(
        plotEl.querySelectorAll("svg")
      ) as SVGSVGElement[];
      svgNode = allSvgs.reduce((largest, current) => {
        const largestSize =
          (largest.width.baseVal?.value || 0) *
          (largest.height.baseVal?.value || 0);
        const currentSize =
          (current.width.baseVal?.value || 0) *
          (current.height.baseVal?.value || 0);
        return currentSize > largestSize ? current : largest;
      }, allSvgs[0]);
    }

    // D3 selections
    const svg = d3.select(svgNode);

    // Find all circles - Observable Plot uses <circle> elements for dots
    const allCircles = svg.selectAll<SVGCircleElement, unknown>("circle");
    if (allCircles.size() === 0) {
      console.warn("No circles found in plot - brush not initialized");
      return;
    }

    // Get parent group of first circle to share coordinate space
    const firstCircle = allCircles.node();
    const marksGroup = firstCircle!.parentNode as SVGGElement;

    // Compute extent from the group's bounding box in its local coordinates
    const bbox = marksGroup.getBBox();
    const width = Math.max(1, bbox.width);
    const height = Math.max(1, bbox.height);

    // Select circles within the same group
    const circles = d3
      .select(marksGroup)
      .selectAll<SVGCircleElement, unknown>("circle");

    // Define brush
    const brush = d3
      .brush()
      .extent([
        [0, 0],
        [width, height],
      ])
      .on("start brush", (event: d3.D3BrushEvent<unknown>) => {
        const sel = event.selection as
          | [[number, number], [number, number]]
          | null;
        let count = 0;
        if (sel) {
          const [[x0, y0], [x1, y1]] = sel;
          circles.each(function () {
            const el = this as SVGCircleElement;
            const cx = +el.getAttribute("cx")!;
            const cy = +el.getAttribute("cy")!;
            const inside = x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;
            if (inside) {
              count++;
              el.style.opacity = "0.7";
            } else {
              el.style.opacity = "0.15";
            }
          });
        } else {
          circles.each(function () {
            (this as SVGCircleElement).style.opacity = "0.7";
          });
        }
        setSelectedCount(count);
      })
      .on("end", (event: d3.D3BrushEvent<unknown>) => {
        if (!event.selection) {
          circles.each(function () {
            (this as SVGCircleElement).style.opacity = "0.7";
          });
          setSelectedCount(0);
        }
      });

    // Add brush layer above circles in the same group
    const marksSelection = d3.select(marksGroup);
    const brushLayer = marksSelection
      .append("g")
      .attr("class", "brush")
      .style("cursor", "crosshair")
      .call(brush as any);

    // Ensure brush is on top and captures pointer events
    (brushLayer as any).raise?.();
    brushLayer
      .select(".overlay")
      .style("pointer-events", "all")
      .style("cursor", "crosshair");
    brushLayer
      .select(".selection")
      .style("pointer-events", "all")
      .style("cursor", "move")
      .style("fill", "rgba(80, 120, 255, 0.14)")
      .style("stroke", "#5569ff")
      .style("stroke-width", "2px");

    // Add keyboard listener for Escape key to clear selection
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        brushLayer.call(brush.move as any, null);
        circles.each(function () {
          (this as SVGCircleElement).style.opacity = "0.7";
        });
        setSelectedCount(0);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      d3.select(plotEl).remove();
    };
  }, [data]);

  return (
    <div>
      <figure ref={containerRef} className="plot" />
      <div style={{ marginTop: 8, fontSize: 12, color: "#555" }}>
        Selected: {selectedCount}
      </div>
    </div>
  );
}
