import * as d3 from "d3";

/**
 * Creates a size legend SVG element
 */
export function createSizeLegend(
  data: number[],
  domain: [number, number],
  range: [number, number],
  label: string = "Size"
): SVGSVGElement {
  // Create size legend SVG
  const sizeLegendSvg = d3
    .create("svg")
    .attr("width", 180)
    .attr("height", 50)
    .style("font", "10px system-ui, sans-serif")
    .style("display", "block");

  // Add title
  sizeLegendSvg
    .append("text")
    .attr("x", 0)
    .attr("y", 10)
    .style("font-weight", "bold")
    .text(label);

  // Create scale
  const rScale = d3.scaleLinear().domain(domain).range(range);

  // Add circles and labels
  let xOffset = 10;
  data.forEach((val) => {
    const r = rScale(val);
    sizeLegendSvg
      .append("circle")
      .attr("cx", xOffset + r)
      .attr("cy", 25)
      .attr("r", r)
      .attr("fill", "#888")
      .attr("stroke", "#555")
      .attr("stroke-width", 0.5)
      .attr("fill-opacity", 0.7);

    sizeLegendSvg
      .append("text")
      .attr("x", xOffset + r)
      .attr("y", 42)
      .attr("text-anchor", "middle")
      .style("font-size", "9px")
      .text(val.toFixed(0));

    xOffset += r * 2 + 8;
  });

  return sizeLegendSvg.node()!;
}

/**
 * Creates a legend wrapper container with horizontal layout
 */
export function createLegendWrapper(): HTMLDivElement {
  const wrapper = document.createElement("div");
  wrapper.style.display = "flex";
  wrapper.style.flexDirection = "row";
  wrapper.style.gap = "30px";
  wrapper.style.alignItems = "center";
  wrapper.style.marginBottom = "10px";
  wrapper.style.flexWrap = "nowrap";
  return wrapper;
}
