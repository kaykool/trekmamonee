export const globalDateState = $state({
	currentDate: new Date()
});

export function resetToToday() {
	globalDateState.currentDate = new Date();
}
