/**
 * A custom storage adapter for Supabase that can switch between
 * localStorage and sessionStorage based on user preference.
 */
class DynamicAuthStorage {
  private storage: Storage = window.localStorage;

  /**
   * Sets the storage mechanism.
   * @param persist If true, uses localStorage. If false, uses sessionStorage.
   */
  public setPersistence(persist: boolean): void {
    this.storage = persist ? window.localStorage : window.sessionStorage;
  }

  getItem(key: string): string | null {
    // When retrieving the session, Supabase will call this.
    // We need to check both storages to find a potential existing session,
    // regardless of the current persistence setting. localStorage is checked first.
    return window.localStorage.getItem(key) ?? window.sessionStorage.getItem(key);
  }

  setItem(key: string, value: string): void {
    // When a new session is set (e.g., after login), this is called.
    // It will use the storage mechanism selected via `setPersistence`.
    this.storage.setItem(key, value);
  }

  removeItem(key: string): void {
    // On logout, Supabase calls this. We remove the session from both
    // storages to ensure a clean state.
    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
  }
}

export const authStorage = new DynamicAuthStorage();
