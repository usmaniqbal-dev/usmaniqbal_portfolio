// Cloudflare Workers global polyfills for WeakRef and FinalizationRegistry
if (typeof (globalThis as unknown as Record<string, unknown>).WeakRef === "undefined") {
  (globalThis as unknown as Record<string, unknown>).WeakRef = class WeakRef<T extends object> {
    #target: T;
    constructor(target: T) {
      this.#target = target;
    }
    deref(): T | undefined {
      return this.#target;
    }
  };
}

if (typeof (globalThis as unknown as Record<string, unknown>).FinalizationRegistry === "undefined") {
  (globalThis as unknown as Record<string, unknown>).FinalizationRegistry = class FinalizationRegistry {
    register() {}
    unregister() {}
  };
}
