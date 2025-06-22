// src/structures/Set.ts
export class CustomSet<T> {
  private data: Set<T>;

  constructor() {
    this.data = new Set<T>();
  }

  add(value: T): void {
    this.data.add(value);
  }

  has(value: T): boolean {
    return this.data.has(value);
  }

  delete(value: T): boolean {
    return this.data.delete(value);
  }

  clear(): void {
    this.data.clear();
  }

  values(): T[] {
    return Array.from(this.data);
  }

  size(): number {
    return this.data.size;
  }
}
