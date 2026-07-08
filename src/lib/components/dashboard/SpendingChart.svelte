<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import { Chart, registerables } from 'chart.js';
	import type { CategoryTotal } from '$lib/db/queries';
	import { formatIDR, resolveTailwindColor } from '$lib/utils';

	Chart.register(...registerables);

	let {
		categoryBreakdown,
		totalExpense
	}: {
		categoryBreakdown: CategoryTotal[];
		totalExpense: number;
	} = $props();

	let chartCanvas = $state<HTMLCanvasElement | null>(null);
	let chartInstance: Chart | null = null;

	$effect(() => {
		if (chartCanvas && categoryBreakdown.length > 0) {
			if (chartInstance) {
				chartInstance.destroy();
			}
			chartInstance = new Chart(chartCanvas, {
				type: 'doughnut',
				data: {
					labels: categoryBreakdown.map((c) => c.categoryName),
					datasets: [
						{
							data: categoryBreakdown.map((c) => c.total),
							backgroundColor: categoryBreakdown.map((c) => resolveTailwindColor(c.color)),
							borderWidth: 2,
							borderColor: 'transparent'
						}
					]
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					cutout: '75%',
					plugins: {
						legend: {
							display: false
						}
					}
				}
			});
		} else if (chartInstance) {
			chartInstance.destroy();
			chartInstance = null;
		}

		return () => {
			if (chartInstance) {
				chartInstance.destroy();
				chartInstance = null;
			}
		};
	});
</script>

<Card class="flex flex-col gap-4 p-6 bg-surface-light dark:bg-surface-dark">
	<h2 class="text-xs font-bold tracking-wider text-text-light/50 dark:text-text-dark/50">
		SPENDING CHART
	</h2>

	{#if categoryBreakdown.length === 0}
		<div class="flex flex-col items-center justify-center py-8">
			<span class="text-text-light/50 dark:text-text-dark/50">No expenses this month</span>
		</div>
	{:else}
		<div class="relative flex items-center justify-center h-48 md:h-56">
			<canvas bind:this={chartCanvas}></canvas>
			<div class="absolute flex flex-col items-center justify-center text-center">
				<span class="text-xs font-medium text-text-light/50 dark:text-text-dark/50">Total</span>
				<span class="text-xl font-bold text-text-light dark:text-text-dark"
					>{formatIDR(totalExpense)}</span
				>
			</div>
		</div>

		<!-- Category Breakdown -->
		<div class="flex flex-col gap-4 mt-2">
			<h3 class="text-xs font-bold tracking-wider text-text-light/50 dark:text-text-dark/50">
				BY CATEGORY
			</h3>
			<div class="flex flex-col gap-3">
				{#each categoryBreakdown as item (item.categoryId)}
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-3">
							<div
								class="flex h-8 w-8 items-center justify-center rounded-full {item.color} text-base text-white"
							>
								{item.icon}
							</div>
							<span class="text-sm font-semibold text-text-light dark:text-text-dark"
								>{item.categoryName}</span
							>
						</div>
						<div class="flex flex-col items-end">
							<span class="text-sm font-bold text-text-light dark:text-text-dark"
								>{formatIDR(item.total)}</span
							>
							<span class="text-xs text-text-light/50 dark:text-text-dark/50"
								>{item.percentage.toFixed(0)}%</span
							>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</Card>
