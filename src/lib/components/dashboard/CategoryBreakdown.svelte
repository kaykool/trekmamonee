<script lang="ts">
	import { TAILWIND_TO_HEX } from '$lib/constants';
	import type { CategoryTotal } from '$lib/db/queries';

	let {
		breakdown
	}: {
		breakdown: CategoryTotal[];
	} = $props();

	const formatCurrency = (amount: number) =>
		new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(amount);
</script>

{#if breakdown.length > 0}
	<div class="flex flex-col gap-2">
		<h2
			class="text-sm font-semibold uppercase tracking-wide text-text-light/60 dark:text-text-dark/60"
		>
			By Category
		</h2>

		<div class="flex flex-col gap-1.5">
			{#each breakdown as cat (cat.categoryId)}
				<div
					class="flex items-center gap-3 rounded-xl bg-surface-light px-3 py-2.5 dark:bg-surface-dark"
				>
					<!-- Icon -->
					<div
						class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base text-white shadow-sm {cat.color}"
					>
						{cat.icon}
					</div>

					<!-- Name + Progress bar -->
					<div class="flex min-w-0 flex-1 flex-col gap-1">
						<div class="flex items-center justify-between">
							<span class="truncate text-sm font-medium text-text-light dark:text-text-dark">
								{cat.categoryName}
							</span>
							<span class="shrink-0 text-sm font-semibold text-text-light dark:text-text-dark">
								{formatCurrency(cat.total)}
							</span>
						</div>
						<!-- Progress bar -->
						<div
							class="h-1.5 w-full overflow-hidden rounded-full bg-surface-dark/10 dark:bg-surface-light/10"
						>
							<div
								class="h-full rounded-full transition-all duration-500 ease-out"
								style="width: {cat.percentage}%; background-color: {TAILWIND_TO_HEX[cat.color] ||
									'#6b7280'}"
							></div>
						</div>
					</div>

					<!-- Percentage -->
					<span
						class="shrink-0 text-xs font-medium text-text-light/50 dark:text-text-dark/50 w-10 text-right"
					>
						{cat.percentage.toFixed(0)}%
					</span>
				</div>
			{/each}
		</div>
	</div>
{/if}
