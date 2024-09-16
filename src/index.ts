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

  clear () {
    this.#map.clear();
    const newMap = new Map();
    this.#map = newMap;
    this.#registry = new FinalizationRegistry((key) => {
      newMap.delete(key);
    });
  }
}
