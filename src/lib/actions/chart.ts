import {
  Chart,
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend,
  type ChartConfiguration,
} from 'chart.js';
import type { ActionReturn } from 'svelte/action';

// Register only the Chart.js components we actually use (tree-shaking)
Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

/**
 * Svelte action that manages a Chart.js instance on a <canvas> element.
 *
 * Usage:
 *   <canvas use:chart={chartConfig}></canvas>
 *
 * The action creates the chart on mount, updates it when config changes,
 * and destroys it on unmount.
 */
export function chart(
  canvas: HTMLCanvasElement,
  config: ChartConfiguration
): ActionReturn<ChartConfiguration> {
  let instance = new Chart(canvas, config);

  return {
    update(newConfig: ChartConfiguration) {
      instance.destroy();
      instance = new Chart(canvas, newConfig);
    },
    destroy() {
      instance.destroy();
    },
  };
}
