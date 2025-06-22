// src/structures/Queue.ts
export class Queue<T> {
  private items: T[] = [];

  enqueue(item: T) {
    this.items.push(item);
  }

  dequeue(): T | undefined {
    return this.items.shift();
  }

  peek(): T | undefined {
    return this.items[0];
  }

  getItems(): T[] {
    return [...this.items];
  }

  size(): number {
    return this.items.length;
  }
}
