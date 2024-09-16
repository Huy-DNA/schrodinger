import { isObject } from './utils';

export class Catche<K, V> {
  #map: Map<K, unknown>;
  #registry: FinalizationRegistry<K>;
  constructor () {
    const map = new Map();
    this.#map = map;
    this.#registry = new FinalizationRegistry((key) => {
      map.delete(key);
    });
  }

  get (key: K): V | undefined {
    const value = this.#map.get(key);
    if (value instanceof WeakRef) {
      return value.deref();
    }
    return value as V | undefined;
  }

  set (key: K, value: V, options: { alwaysAlive: boolean } | undefined) {
    const { alwaysAlive = false } = options || {};
    const oldVal = this.get(key);
    if (isObject(oldVal)) {
      this.#registry.unregister(oldVal);
    }
    if (isObject(value) && !alwaysAlive) {
      this.#map.set(key, new WeakRef(value));
      this.#registry.register(value, key, value);
    } else {
      this.#map.set(key, value);
    }
  }

  delete (key: K) {
    const oldVal = this.get(key);
    if (oldVal) {
      this.#registry.unregister(oldVal);
    }
    this.#map.delete(key);
  }
  
  has (key: K): boolean {
    return !!this.get(key);
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
        const value = entry[1] instanceof WeakRef ? entry[1].deref() : entry[1];
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
        const value = entry[1] instanceof WeakRef ? entry[1].deref() : entry[1];
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
        const value = entry[1] instanceof WeakRef ? entry[1].deref() : entry[1];
        if (value !== undefined) {
          yield value;
        }
      }
    }());
  }

  forEach (fn: (value: V, key: K, map: Catche<K, V>) => void, thisArg?: unknown) {
    this.#map.forEach((value, key) => {
      const _value = value instanceof WeakRef ? value.deref() : value;
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
