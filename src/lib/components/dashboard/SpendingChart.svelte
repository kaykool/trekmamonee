<script lang="ts">
  import Card from '$lib/components/ui/Card.svelte';
  import { chart } from '$lib/actions/chart';
  import { TAILWIND_TO_HEX } from '$lib/constants';
  import type { CategoryTotal } from '$lib/db/queries';
  import type { ChartConfiguration } from 'chart.js';

  let {
    breakdown,
    isDark = false,
  }: {
    breakdown: CategoryTotal[];
    isDark?: boolean;
  } = $props();

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  let totalExpense = $derived(
    breakdown.reduce((sum, cat) => sum + cat.total, 0)
  );

  let chartConfig = $derived<ChartConfiguration<'doughnut'>>({
    type: 'doughnut',
    data: {
      labels: breakdown.map(c => c.categoryName),
      datasets: [
        {
          data: breakdown.map(c => c.total),
          backgroundColor: breakdown.map(
            c => TAILWIND_TO_HEX[c.color] || '#6b7280'
          ),
          borderWidth: 0,
          hoverOffset: 8,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      cutout: '65%',
      plugins: {
        legend: {
          display: false, // We use CategoryBreakdown component instead
        },
        tooltip: {
          backgroundColor: isDark ? '#1e293b' : '#ffffff',
          titleColor: isDark ? '#e2e8f0' : '#1e293b',
          bodyColor: isDark ? '#cbd5e1' : '#475569',
          borderColor: isDark ? '#334155' : '#e2e8f0',
          borderWidth: 1,
          padding: 12,
          callbacks: {
            label: (ctx) => {
              const value = ctx.parsed;
              const pct = totalExpense > 0 ? ((value / totalExpense) * 100).toFixed(1) : '0';
              return ` ${formatCurrency(value)} (${pct}%)`;
            },
          },
        },
      },
    },
  });

  let hasData = $derived(breakdown.length > 0);
</script>

<Card class="flex flex-col items-center gap-4">
  <h2 class="self-start text-sm font-semibold uppercase tracking-wide text-text-light/60 dark:text-text-dark/60">
    Spending Overview
  </h2>

  {#if hasData}
    <div class="relative mx-auto w-full max-w-[260px]">
      <canvas use:chart={chartConfig}></canvas>

      <!-- Center label -->
      <div class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span class="text-xs text-text-light/50 dark:text-text-dark/50">Total</span>
        <span class="text-lg font-bold text-text-light dark:text-text-dark">
          {formatCurrency(totalExpense)}
        </span>
      </div>
    </div>
  {:else}
    <div class="flex aspect-square w-full max-w-[260px] items-center justify-center">
      <span class="text-sm text-text-light/40 dark:text-text-dark/40">
        No expenses this month
      </span>
    </div>
  {/if}
</Card>
