import { PlotScatterBrush } from "./components/PlotScatterBrush";

export default function App() {
  return (
    <div className="app">
      <h1>Observable Plot: 4D Scatter with Brush</h1>
      <p>
        Each point has 4 random variables mapped to: <strong>X position</strong>
        , <strong>Y position</strong>, <strong>Size</strong>, and{" "}
        <strong>Color</strong>.
      </p>
      <p>
        <em>Drag to select points. Non-selected points become translucent.</em>
      </p>
      <div className="chart-container">
        <PlotScatterBrush />
      </div>
    </div>
  );
}
