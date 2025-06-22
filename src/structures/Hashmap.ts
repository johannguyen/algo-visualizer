// src/structures/HashMap.ts
export class HashMap<K, V> {
  private map: Map<K, V>;

  constructor() {
    this.map = new Map<K, V>();
  }

  set(key: K, value: V): void {
    this.map.set(key, value);
  }

  get(key: K): V | undefined {
    return this.map.get(key);
  }

  has(key: K): boolean {
    return this.map.has(key);
  }

  delete(key: K): boolean {
    return this.map.delete(key);
  }

  clear(): void {
    this.map.clear();
  }

  keys(): K[] {
    return Array.from(this.map.keys());
  }

  values(): V[] {
    return Array.from(this.map.values());
  }

  entries(): [K, V][] {
    return Array.from(this.map.entries());
  }

  size(): number {
    return this.map.size;
  }

  toObject(): Record<string, V> {
    const obj: Record<string, V> = {};
    for (const [key, value] of this.map.entries()) {
      obj[String(key)] = value;
    }
    return obj;
  }
}
