import { browser } from '$app/environment';

class SyncStore {
	hasUnsyncedChanges = $state(false);
	cloudPassword = $state('');

	constructor() {
		if (browser) {
			this.hasUnsyncedChanges = localStorage.getItem('has_unsynced_changes') === 'true';
			this.cloudPassword = localStorage.getItem('cloud_sync_password') || '';
		}
	}

	setUnsynced(value: boolean) {
		this.hasUnsyncedChanges = value;
		if (browser) {
			localStorage.setItem('has_unsynced_changes', value.toString());
		}
	}

	setCloudPassword(value: string) {
		this.cloudPassword = value;
		if (browser) {
			localStorage.setItem('cloud_sync_password', value);
		}
	}
}

export const syncStore = new SyncStore();
