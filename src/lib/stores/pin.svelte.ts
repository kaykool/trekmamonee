import { browser } from '$app/environment';

const PIN_STORAGE_KEY = 'expense_tracker_pin';

async function hashPin(pin: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

class PinStore {
  isLocked = $state(true);
  hasPin = $state(false);

  constructor() {
    if (browser) {
      const hash = localStorage.getItem(PIN_STORAGE_KEY);
      this.hasPin = !!hash;
      this.isLocked = !!hash;
    }
  }

  async setup(pin: string) {
    if (!browser) return;
    const hash = await hashPin(pin);
    localStorage.setItem(PIN_STORAGE_KEY, hash);
    this.hasPin = true;
    this.isLocked = false;
  }

  async verify(pin: string): Promise<boolean> {
    if (!browser) return false;
    const storedHash = localStorage.getItem(PIN_STORAGE_KEY);
    if (!storedHash) return true;
    
    const inputHash = await hashPin(pin);
    const isValid = inputHash === storedHash;
    if (isValid) {
      this.isLocked = false;
    }
    return isValid;
  }

  remove() {
    if (!browser) return;
    localStorage.removeItem(PIN_STORAGE_KEY);
    this.hasPin = false;
    this.isLocked = false;
  }

  lock() {
    if (this.hasPin) {
      this.isLocked = true;
    }
  }
}

export const pinStore = new PinStore();
