// src/structures/Deque.ts
export class Deque<T> {
  private items: T[] = [];

  addFront(value: T): void {
    this.items.unshift(value);
  }

  addBack(value: T): void {
    this.items.push(value);
  }

  removeFront(): T | undefined {
    return this.items.shift();
  }

  removeBack(): T | undefined {
    return this.items.pop();
  }

  peekFront(): T | undefined {
    return this.items[0];
  }

  peekBack(): T | undefined {
    return this.items[this.items.length - 1];
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  clear(): void {
    this.items = [];
  }

  toArray(): T[] {
    return [...this.items];
  }
}
