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
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface ScatterPlotProps {
  data: Point[];
  config?: ScatterPlotConfig;
  onSelectionChange?: (
    selectedPoints: Point[],
    selection: BrushSelection | null
  ) => void;
  enableBrush?: boolean;
  showLegends?: boolean;
}
