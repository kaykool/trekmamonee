import { SvelteDate } from 'svelte/reactivity';

export const globalDateState = $state({
	currentDate: new SvelteDate()
});

export function resetToToday() {
	globalDateState.currentDate = new SvelteDate();
}
