import { browser } from '$app/environment';

class SyncStore {
	hasUnsyncedChanges = $state(false);

	constructor() {
		if (browser) {
			this.hasUnsyncedChanges = localStorage.getItem('has_unsynced_changes') === 'true';
		}
	}

	setUnsynced(value: boolean) {
		this.hasUnsyncedChanges = value;
		if (browser) {
			localStorage.setItem('has_unsynced_changes', value.toString());
		}
	}
}

export const syncStore = new SyncStore();
