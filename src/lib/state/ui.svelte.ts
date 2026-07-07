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
    isDestructive: true,
    onconfirm: () => {}
  }
});

export function openConfirmDialog(options: {
  title: string;
  description: string;
  confirmText?: string;
  isDestructive?: boolean;
  onconfirm: () => void;
}) {
  uiState.confirmDialog = {
    isOpen: true,
    title: options.title,
    description: options.description,
    confirmText: options.confirmText ?? 'Confirm',
    isDestructive: options.isDestructive ?? true,
    onconfirm: options.onconfirm
  };
}

export function closeConfirmDialog() {
  uiState.confirmDialog.isOpen = false;
}

export function addToast(message: string, type: ToastType = 'info') {
  const id = crypto.randomUUID();
  uiState.toasts.push({ id, message, type });
  
  // Auto remove after 3 seconds
  setTimeout(() => {
    uiState.toasts = uiState.toasts.filter(t => t.id !== id);
  }, 3000);
}

export function removeToast(id: string) {
  uiState.toasts = uiState.toasts.filter(t => t.id !== id);
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
  }, 300);
}
