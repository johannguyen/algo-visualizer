// src/structures/DoublyLinkedList.ts

class Node<T> {
  value: T;
  next: Node<T> | null = null;
  prev: Node<T> | null = null;

  constructor(value: T) {
    this.value = value;
  }
}

export class DoublyLinkedList<T> {
  private head: Node<T> | null = null;
  private tail: Node<T> | null = null;

  insertAtHead(value: T) {
    const node = new Node(value);
    if (!this.head) {
      this.head = this.tail = node;
    } else {
      node.next = this.head;
      this.head.prev = node;
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
      node.prev = this.tail;
      this.tail.next = node;
      this.tail = node;
    }
  }

  insertAt(index: number, value: T) {
    if (index <= 0) {
      this.insertAtHead(value);
      return;
    }

    const node = new Node(value);
    let current = this.head;
    let i = 0;

    while (current && i < index - 1) {
      current = current.next;
      i++;
    }

    if (!current || !current.next) {
      this.insertAtTail(value);
    } else {
      node.next = current.next;
      node.prev = current;
      current.next.prev = node;
      current.next = node;
    }
  }

  removeHead() {
    if (!this.head) return;

    if (this.head === this.tail) {
      this.head = this.tail = null;
    } else {
      this.head = this.head.next;
      if (this.head) this.head.prev = null;
    }
  }

  removeTail() {
    if (!this.tail) return;

    if (this.tail === this.head) {
      this.head = this.tail = null;
    } else {
      this.tail = this.tail.prev;
      if (this.tail) this.tail.next = null;
    }
  }

  removeAt(index: number) {
    if (index === 0) {
      this.removeHead();
      return;
    }

    let current = this.head;
    let i = 0;

    while (current && i < index) {
      current = current.next;
      i++;
    }

    if (!current) return;

    if (current.prev) current.prev.next = current.next;
    if (current.next) current.next.prev = current.prev;

    if (current === this.head) this.head = current.next;
    if (current === this.tail) this.tail = current.prev;
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

  toArrayReverse(): T[] {
    const result: T[] = [];
    let current = this.tail;
    while (current) {
      result.push(current.value);
      current = current.prev;
    }
    return result;
  }

  clear() {
    this.head = this.tail = null;
  }

  getHead(): T | null {
    return this.head?.value ?? null;
  }

  getTail(): T | null {
    return this.tail?.value ?? null;
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
}
