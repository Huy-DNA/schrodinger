export class Catche<K, V extends object> {
  #map: Map<K, WeakRef<V>>;
  #registry: FinalizationRegistry<K>;
  constructor () {
    const map = new Map();
    this.#map = map;
    this.#registry = new FinalizationRegistry((key) => {
      map.delete(key);
    });
  }

  get (key: K): V | undefined {
    return this.#map.get(key)?.deref();
  }

  set (key: K, value: V) {
    const oldVal = this.#map.get(key)?.deref();
    if (oldVal) {
      this.#registry.unregister(oldVal);
    }
    this.#map.set(key, new WeakRef(value));
    this.#registry.register(value, key, value);
  }

  delete (key: K) {
    const oldVal = this.#map.get(key)?.deref();
    if (oldVal) {
      this.#registry.unregister(oldVal);
    }
    this.#map.delete(key);
  }
  
  has (key: K): boolean {
    return !!this.#map.get(key)?.deref();
  }

  clear () {
    this.#map.clear();
    const newMap = new Map();
    this.#map = newMap;
    this.#registry = new FinalizationRegistry((key) => {
      newMap.delete(key);
    });
  }

  entries (): Iterator<[K, V], void, undefined> {
    const iter = this.#map.entries();
    return (function* () {
      for (const entry of iter) {
        const value = entry[1].deref();
        if (value !== undefined) {
          yield [entry[0], value];
        }
      }
    }());
  }

  keys (): Iterator<K, void, undefined> {
    const iter = this.#map.entries();
    return (function* () {
      for (const entry of iter) {
        const value = entry[1].deref();
        if (value !== undefined) {
          yield entry[0];
        }
      }
    }());
  }

  values (): Iterator<V, void, undefined> {
    const iter = this.#map.entries();
    return (function* () {
      for (const entry of iter) {
        const value = entry[1].deref();
        if (value !== undefined) {
          yield value;
        }
      }
    }());
  }

  forEach (fn: (value: V, key: K, map: Catche<K, V>) => void, thisArg?: unknown) {
    this.#map.forEach((value, key) => {
      const _value = value.deref();
      if (_value) {
        fn(_value, key, this);
      }
    }, thisArg);
  }

  size (): number {
    return this.#map.size;
  }

  [Symbol.iterator] (): Iterator<V, void, undefined> {
    return this.values();
  }
}
