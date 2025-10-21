/**
 * Type definitions for the scatter plot component
 */

export interface Point {
  x: number;
  y: number;
  size: number;
  color: number;
  [key: string]: any; // Allow additional properties
}

export interface ScatterPlotConfig {
  height?: number;
  width?: number;
  margin?: number;
  xLabel?: string;
  yLabel?: string;
  sizeLabel?: string;
  colorLabel?: string;
  sizeRange?: [number, number];
  colorScheme?: string;
}

export interface BrushSelection {
  x0: number; // Left edge in data coordinates
  y0: number; // Top edge in data coordinates
  x1: number; // Right edge in data coordinates
  y1: number; // Bottom edge in data coordinates
}

export interface ScatterPlotProps {
  data: Point[];
  config?: ScatterPlotConfig;
  onSelectionChange?: (
    selectedPoints: Point[],
    selection: BrushSelection | null
  ) => void;
  enableBrush?: boolean;
  /**
   * Controlled selection - allows setting the brush selection programmatically.
   * Coordinates are in data space (matching the x/y values of your data points).
   * Pass null to clear selection.
   */
  selection?: BrushSelection | null;
}
