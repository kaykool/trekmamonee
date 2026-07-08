import { APP_CONFIG } from '$lib/constants';

export type ToastType = 'success' | 'info' | 'warning' | 'error';
export interface Toast {
	id: string;
	message: string;
	type: ToastType;
}

export const uiState = $state({
	isTransactionSheetOpen: false,
	editingTransactionId: null as string | null,
	toasts: [] as Toast[],
	confirmDialog: {
		isOpen: false,
		title: '',
		description: '',
		confirmText: 'Confirm',
		cancelText: 'Cancel',
		isDestructive: true,
		onconfirm: () => {},
		oncancel: () => {}
	}
});

export function openConfirmDialog(options: {
	title: string;
	description: string;
	confirmText?: string;
	cancelText?: string;
	isDestructive?: boolean;
	onconfirm: () => void | Promise<void>;
	oncancel?: () => void;
}) {
	uiState.confirmDialog = {
		isOpen: true,
		title: options.title,
		description: options.description,
		confirmText: options.confirmText ?? 'Confirm',
		cancelText: options.cancelText ?? 'Cancel',
		isDestructive: options.isDestructive ?? true,
		onconfirm: options.onconfirm,
		oncancel: options.oncancel ?? (() => {})
	};
}

export function closeConfirmDialog() {
	uiState.confirmDialog.isOpen = false;
}

export function addToast(
	message: string,
	type: ToastType = 'info',
	duration: number = APP_CONFIG.toast.defaultDurationMs
) {
	const id = crypto.randomUUID();
	uiState.toasts.push({ id, message, type });

	// Auto remove after duration
	setTimeout(() => {
		uiState.toasts = uiState.toasts.filter((t) => t.id !== id);
	}, duration);
}

export function removeToast(id: string) {
	uiState.toasts = uiState.toasts.filter((t) => t.id !== id);
}

// Helper to open the sheet for adding
export function openAddTransaction() {
	uiState.editingTransactionId = null;
	uiState.isTransactionSheetOpen = true;
}

// Helper to open the sheet for editing
export function openEditTransaction(id: string) {
	uiState.editingTransactionId = id;
	uiState.isTransactionSheetOpen = true;
}

// Helper to close the sheet
export function closeTransactionSheet() {
	uiState.isTransactionSheetOpen = false;
	// Delay clearing the ID slightly so the exit animation finishes cleanly
	setTimeout(() => {
		uiState.editingTransactionId = null;
	}, APP_CONFIG.animations.bottomSheetCloseDelayMs);
}
