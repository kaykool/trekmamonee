<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import { Chart, registerables } from 'chart.js';
	import type { CategoryTotal } from '$lib/db/queries';
	import { formatIDR, resolveTailwindColor } from '$lib/utils';
	import { theme } from '$lib/stores/theme';

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
		const currentTheme = $theme;
		const isDark = document.documentElement.classList.contains('dark');
		
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
						},
						tooltip: {
							backgroundColor: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
							titleColor: isDark ? '#fff' : '#000',
							bodyColor: isDark ? '#fff' : '#000',
							borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
							borderWidth: 1
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
		<div class="flex flex-col items-center justify-center py-12 gap-2 text-center">
			<div class="flex h-12 w-12 items-center justify-center rounded-full bg-surface-dark/5 dark:bg-surface-light/5 text-text-light/40 dark:text-text-dark/40 mb-1">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>
			</div>
			<span class="text-text-light/50 dark:text-text-dark/50 font-medium">No expenses this month</span>
			<span class="text-xs text-text-light/40 dark:text-text-dark/40">Your spending breakdown will appear here</span>
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
								class="flex h-8 w-8 items-center justify-center rounded-full {item.color} text-base text-white leading-none"
							>
								<span class="leading-none flex items-center justify-center h-full w-full">{item.icon}</span>
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
