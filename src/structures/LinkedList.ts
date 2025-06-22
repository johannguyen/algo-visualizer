// src/structures/LinkedList.ts

class Node<T> {
  value: T;
  next: Node<T> | null = null;

  constructor(value: T) {
    this.value = value;
  }
}

export class LinkedList<T> {
  private head: Node<T> | null = null;
  private tail: Node<T> | null = null;

  insertAtHead(value: T) {
    const node = new Node(value);
    if (!this.head) {
      this.head = this.tail = node;
    } else {
      node.next = this.head;
      this.head = node;
    }
  }

  insert(value: T) {
    this.insertAtTail(value);
  }

  insertAtTail(value: T) {
    const node = new Node(value);
    if (!this.tail) {
      this.head = this.tail = node;
    } else {
      this.tail.next = node;
      this.tail = node;
    }
  }

  insertAt(index: number, value: T) {
    if (index <= 0) {
      this.insertAtHead(value);
      return;
    }

    let current = this.head;
    let i = 0;

    while (current && i < index - 1) {
      current = current.next;
      i++;
    }

    const node = new Node(value);
    if (!current || !current.next) {
      this.insertAtTail(value);
    } else {
      node.next = current.next;
      current.next = node;
    }
  }

  removeHead() {
    if (!this.head) return;

    if (this.head === this.tail) {
      this.head = this.tail = null;
    } else {
      this.head = this.head.next;
    }
  }

  removeTail() {
    if (!this.head) return;

    if (this.head === this.tail) {
      this.head = this.tail = null;
    } else {
      let current = this.head;
      while (current.next && current.next !== this.tail) {
        current = current.next;
      }
      current.next = null;
      this.tail = current;
    }
  }

  removeAt(index: number) {
    if (index === 0) {
      this.removeHead();
      return;
    }

    let current = this.head;
    let i = 0;

    while (current && i < index - 1) {
      current = current.next;
      i++;
    }

    if (!current || !current.next) return;

    if (current.next === this.tail) {
      this.tail = current;
    }

    current.next = current.next.next;
  }

  clear() {
    this.head = this.tail = null;
  }

  toArray(): T[] {
    const result: T[] = [];
    let current = this.head;
    while (current) {
      result.push(current.value);
      current = current.next;
    }
    return result;
  }

  size(): number {
    let count = 0;
    let current = this.head;
    while (current) {
      count++;
      current = current.next;
    }
    return count;
  }

  getHead(): T | null {
    return this.head?.value ?? null;
  }

  getTail(): T | null {
    return this.tail?.value ?? null;
  }
}
