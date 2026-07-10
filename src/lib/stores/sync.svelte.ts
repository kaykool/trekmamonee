import { browser } from '$app/environment';

class SyncStore {
	hasUnsyncedChanges = $state(false);
	cloudPassword = $state('');

	constructor() {
		if (browser) {
			this.hasUnsyncedChanges = sessionStorage.getItem('has_unsynced_changes') === 'true';
			this.cloudPassword = sessionStorage.getItem('cloud_sync_password') || '';
		}
	}

	setUnsynced(value: boolean) {
		this.hasUnsyncedChanges = value;
		if (browser) {
			sessionStorage.setItem('has_unsynced_changes', value.toString());
		}
	}

	setCloudPassword(value: string) {
		this.cloudPassword = value;
		if (browser) {
			sessionStorage.setItem('cloud_sync_password', value);
		}
	}
}

export const syncStore = new SyncStore();
