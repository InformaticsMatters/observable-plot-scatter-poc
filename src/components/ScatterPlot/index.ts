/**
 * ScatterPlot Component Library
 *
 * A modular, reusable scatter plot visualization with brush selection
 */

export { ScatterPlot } from "./ScatterPlot";
export type {
  Point,
  ScatterPlotConfig,
  ScatterPlotProps,
  BrushSelection,
} from "./types";
export {
  createScatterPlot,
  findMainSvg,
  getSizeExtentAndTicks,
  getPlotAreaDimensions,
} from "./plot";
export { createLegendWrapper, createSizeLegend } from "./legends";
export { createBrush, clearBrushSelection } from "./brush";
