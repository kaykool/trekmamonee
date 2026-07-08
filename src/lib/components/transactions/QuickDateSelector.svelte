<script lang="ts">
	import { SvelteDate } from 'svelte/reactivity';
	let {
		date = $bindable()
	}: {
		date: string;
	} = $props();

	function getLocalDateString(dateObj: Date) {
		const tzOffset = dateObj.getTimezoneOffset() * 60000;
		return new Date(dateObj.getTime() - tzOffset).toISOString().split('T')[0];
	}

	const todayStr = getLocalDateString(new Date());
	const yesterdayDate = new SvelteDate();
	yesterdayDate.setDate(yesterdayDate.getDate() - 1);
	const yesterdayStr = getLocalDateString(yesterdayDate);

	let dateSelectionMode = $derived.by(() => {
		if (date === todayStr) return 'today';
		if (date === yesterdayStr) return 'yesterday';
		return 'custom';
	});

	let dateInputRef = $state<HTMLInputElement | null>(null);

	function setDateMode(mode: 'today' | 'yesterday') {
		if (mode === 'today') date = todayStr;
		else if (mode === 'yesterday') date = yesterdayStr;
	}

	function triggerDatePicker() {
		try {
			dateInputRef?.showPicker();
		} catch {
			dateInputRef?.focus();
		}
	}
</script>

<div class="flex flex-col gap-2">
	<span class="text-sm font-medium text-text-light/60 dark:text-text-dark/60">Date</span>
	<div class="flex gap-2">
		<button
			class="flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors {dateSelectionMode ===
			'today'
				? 'bg-primary text-white shadow-sm'
				: 'bg-surface-dark/5 text-text-light/80 hover:bg-surface-dark/10 dark:bg-surface-light/5 dark:text-text-dark/80 dark:hover:bg-surface-light/10'}"
			onclick={(e) => {
				e.preventDefault();
				setDateMode('today');
			}}
		>
			Today
		</button>
		<button
			class="flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors {dateSelectionMode ===
			'yesterday'
				? 'bg-primary text-white shadow-sm'
				: 'bg-surface-dark/5 text-text-light/80 hover:bg-surface-dark/10 dark:bg-surface-light/5 dark:text-text-dark/80 dark:hover:bg-surface-light/10'}"
			onclick={(e) => {
				e.preventDefault();
				setDateMode('yesterday');
			}}
		>
			Yesterday
		</button>
		<div class="relative flex-1">
			<button
				class="w-full h-full rounded-lg py-2.5 text-sm font-medium transition-colors {dateSelectionMode ===
				'custom'
					? 'bg-primary text-white shadow-sm'
					: 'bg-surface-dark/5 text-text-light/80 hover:bg-surface-dark/10 dark:bg-surface-light/5 dark:text-text-dark/80 dark:hover:bg-surface-light/10'}"
				onclick={(e) => {
					e.preventDefault();
					triggerDatePicker();
				}}
			>
				{dateSelectionMode === 'custom'
					? new Date(date).toLocaleDateString('id-ID', {
							day: 'numeric',
							month: 'short',
							year: '2-digit'
						})
					: 'Custom'}
			</button>
			<input
				bind:this={dateInputRef}
				type="date"
				bind:value={date}
				class="absolute bottom-0 left-1/2 -z-10 h-0 w-0 -translate-x-1/2 opacity-0"
			/>
		</div>
	</div>
</div>
