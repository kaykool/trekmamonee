<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { db, type Transaction } from '$lib/db';
	import { liveQuery } from 'dexie';
	import { Chart, registerables } from 'chart.js';
	import type { MonthSummary, CategoryTotal } from '$lib/db/queries';
	import { SvelteDate, SvelteMap } from 'svelte/reactivity';
	import { formatIDR, resolveTailwindColor } from '$lib/utils';
	import { theme } from '$lib/stores/theme';

	Chart.register(...registerables);

	let view = $state<'weekly' | 'monthly'>('weekly');
	let currentDate = new SvelteDate();

	function getWeekRange(date: Date) {
		const current = new SvelteDate(date);
		const day = current.getDay();
		const diff = current.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
		const start = new SvelteDate(current.setDate(diff));
		start.setHours(0, 0, 0, 0);

		const end = new SvelteDate(start);
		end.setDate(start.getDate() + 6);
		end.setHours(23, 59, 59, 999);

		return { start, end };
	}

	let dateLabel = $derived.by(() => {
		if (view === 'weekly') {
			const { start, end } = getWeekRange(currentDate);
			const options: Intl.DateTimeFormatOptions = {
				month: 'short',
				day: 'numeric',
				year: 'numeric'
			};
			return `${start.toLocaleDateString('default', options)} - ${end.toLocaleDateString('default', options)}`;
		} else {
			return currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
		}
	});

	function prev() {
		if (view === 'weekly') {
			currentDate.setDate(currentDate.getDate() - 7);
		} else {
			currentDate.setFullYear(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
		}
	}

	function next() {
		if (view === 'weekly') {
			currentDate.setDate(currentDate.getDate() + 7);
		} else {
			currentDate.setFullYear(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
		}
	}

	let summary = $state<MonthSummary>({ totalIncome: 0, totalExpense: 0, balance: 0 });
	let breakdown = $state<CategoryTotal[]>([]);

	// Reactive subscription to Dexie data based on view & date
	$effect(() => {
		const currentView = view;
		const dateObj = currentDate;

		const sub = liveQuery(async () => {
			let transactions: Transaction[];

			if (currentView === 'weekly') {
				const { start, end } = getWeekRange(dateObj);
				const startStr = start.toISOString().split('T')[0];
				const endStr = end.toISOString().split('T')[0];
				transactions = await db.transactions
					.where('date')
					.between(startStr, endStr, true, true)
					.toArray();
			} else {
				const year = dateObj.getFullYear();
				const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
				const monthPrefix = `${year}-${month}`;
				transactions = await db.transactions.where('date').startsWith(monthPrefix).toArray();
			}

			const categoriesList = await db.categories.toArray();
			const categoryMap = new SvelteMap(categoriesList.map((c) => [c.id, c]));

			let totalIncome = 0;
			let totalExpense = 0;
			const categoryTotals = new SvelteMap<string, number>();

			for (const tx of transactions) {
				if (tx.type === 'income') {
					totalIncome += tx.amount;
				} else {
					totalExpense += tx.amount;
					categoryTotals.set(tx.categoryId, (categoryTotals.get(tx.categoryId) || 0) + tx.amount);
				}
			}

			const list: CategoryTotal[] = [];
			for (const [categoryId, total] of categoryTotals) {
				const cat = categoryMap.get(categoryId);
				list.push({
					categoryId,
					categoryName: cat?.name || 'Unknown',
					icon: cat?.icon || '🏷️',
					color: cat?.color || 'bg-gray-500',
					total,
					percentage: totalExpense > 0 ? (total / totalExpense) * 100 : 0
				});
			}
			list.sort((a, b) => b.total - a.total);

			return {
				summary: { totalIncome, totalExpense, balance: totalIncome - totalExpense },
				breakdown: list
			};
		}).subscribe((data) => {
			if (data) {
				summary = data.summary;
				breakdown = data.breakdown;
			}
		});

		return () => sub.unsubscribe();
	});

	// Chart rendering logic
	let chartCanvas = $state<HTMLCanvasElement | null>(null);
	let chartInstance: Chart | null = null;

	$effect(() => {
		const currentTheme = $theme;
		const isDark = document.documentElement.classList.contains('dark');
		const textColor = isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)';
		const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

		if (chartCanvas && breakdown.length > 0) {
			if (chartInstance) {
				chartInstance.destroy();
			}
			chartInstance = new Chart(chartCanvas, {
				type: 'bar',
				data: {
					labels: breakdown.map((b) => b.categoryName),
					datasets: [
						{
							label: 'Spending',
							data: breakdown.map((b) => b.total),
							backgroundColor: breakdown.map((b) => resolveTailwindColor(b.color)),
							borderRadius: 8,
							borderWidth: 0
						}
					]
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					plugins: {
						legend: {
							display: false
						},
						tooltip: {
							backgroundColor: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
							titleColor: isDark ? '#fff' : '#000',
							bodyColor: isDark ? '#fff' : '#000',
							borderColor: gridColor,
							borderWidth: 1
						}
					},
					scales: {
						y: {
							beginAtZero: true,
							grid: {
								color: gridColor
							},
							ticks: {
								color: textColor
							}
						},
						x: {
							grid: {
								display: false
							},
							ticks: {
								color: textColor
							}
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

<svelte:head>
	<title>Reports | Trekmamonee</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<!-- View toggle -->
	<div class="flex w-full rounded-lg bg-surface-dark/5 p-1 dark:bg-surface-light/10">
		<button
			class="flex-1 rounded-md py-2 text-sm font-medium transition-colors {view === 'weekly'
				? 'bg-surface-light text-text-light shadow-sm dark:bg-surface-dark dark:text-text-dark'
				: 'text-text-light/60 dark:text-text-dark/60'}"
			onclick={() => (view = 'weekly')}
		>
			Weekly
		</button>
		<button
			class="flex-1 rounded-md py-2 text-sm font-medium transition-colors {view === 'monthly'
				? 'bg-surface-light text-text-light shadow-sm dark:bg-surface-dark dark:text-text-dark'
				: 'text-text-light/60 dark:text-text-dark/60'}"
			onclick={() => (view = 'monthly')}
		>
			Monthly
		</button>
	</div>

	<!-- Date Navigation -->
	<div class="flex items-center justify-between">
		<Button variant="ghost" size="icon" onclick={prev}>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"><path d="m15 18-6-6 6-6" /></svg
			>
		</Button>
		<span class="font-semibold text-text-light dark:text-text-dark">{dateLabel}</span>
		<Button variant="ghost" size="icon" onclick={next}>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"><path d="m9 18 6-6-6-6" /></svg
			>
		</Button>
	</div>

	<!-- Financial Overview Cards -->
	<div class="flex flex-col gap-3">
		<Card class="flex flex-col gap-1 p-4 bg-surface-light dark:bg-surface-dark">
			<span class="text-xs font-bold tracking-wider text-text-light/50 dark:text-text-dark/50"
				>INCOME</span
			>
			<span class="text-lg font-bold text-primary"
				>{formatIDR(summary.totalIncome)}</span
			>
		</Card>
		<Card class="flex flex-col gap-1 p-4 bg-surface-light dark:bg-surface-dark">
			<span class="text-xs font-bold tracking-wider text-text-light/50 dark:text-text-dark/50"
				>EXPENSE</span
			>
			<span class="text-lg font-bold text-danger"
				>{formatIDR(summary.totalExpense)}</span
			>
		</Card>
		<Card class="flex flex-col gap-1 p-4 bg-surface-light dark:bg-surface-dark">
			<span class="text-xs font-bold tracking-wider text-text-light/50 dark:text-text-dark/50"
				>SAVINGS</span
			>
			<span
				class="text-lg font-bold {summary.balance >= 0
					? 'text-primary'
					: 'text-danger'}"
			>
				{formatIDR(summary.balance)}
			</span>
		</Card>
	</div>

	<!-- Spending Chart -->
	<Card class="flex flex-col gap-4 p-6 bg-surface-light dark:bg-surface-dark">
		<h2 class="text-xs font-bold tracking-wider text-text-light/50 dark:text-text-dark/50">
			SPENDING ANALYSIS
		</h2>

		{#if breakdown.length === 0}
			<div class="flex flex-col items-center justify-center py-8">
				<span class="text-text-light/50 dark:text-text-dark/50">No expenses in this period</span>
			</div>
		{:else}
			<div class="relative h-56 w-full">
				<canvas bind:this={chartCanvas}></canvas>
			</div>

			<!-- Category breakdown rows -->
			<div class="flex flex-col gap-3 mt-4">
				{#each breakdown as item (item.categoryId)}
					<div class="flex flex-col gap-1">
						<div class="flex items-center justify-between text-sm">
							<span class="font-medium text-text-light dark:text-text-dark"
								>{item.icon} {item.categoryName}</span
							>
							<div class="text-right font-semibold">
								<span class="text-text-light dark:text-text-dark">{formatIDR(item.total)}</span>
								<span class="text-xs text-text-light/50 dark:text-text-dark/50 ml-2"
									>{item.percentage.toFixed(0)}%</span
								>
							</div>
						</div>
						<!-- Progress bar -->
						<div
							class="h-2 w-full bg-surface-dark/10 rounded-full dark:bg-surface-light/10 overflow-hidden"
						>
							<div
								class="h-full rounded-full transition-all duration-300 {item.color}"
								style="width: {item.percentage}%"
							></div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</Card>
</div>
