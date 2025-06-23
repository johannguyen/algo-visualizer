// AVLTree.ts

export class AVLNode<T> {
  public value: T;
  public left: AVLNode<T> | null = null;
  public right: AVLNode<T> | null = null;
  public height: number = 1;

  constructor(value: T) {
    this.value = value;
  }
}

export class AVLTree<T> {
  public root: AVLNode<T> | null = null;
  private comparator: (a: T, b: T) => number;

  constructor(comparator: (a: T, b: T) => number) {
    this.comparator = comparator;
  }

  public insert(value: T): void {
    this.root = this.insertRecursive(this.root, value);
  }

  public clear(): void {
    this.root = null;
  }

  public searchPath(target: T): AVLNode<T>[] {
    const path: AVLNode<T>[] = [];
    let current = this.root;

    while (current !== null) {
      path.push(current);
      const cmp = this.comparator(target, current.value);
      if (cmp === 0) break;
      current = cmp < 0 ? current.left : current.right;
    }

    return path;
  }

  private insertRecursive(node: AVLNode<T> | null, value: T): AVLNode<T> {
    if (node === null) {
      return new AVLNode(value);
    }

    const comparison = this.comparator(value, node.value);

    if (comparison < 0) {
      node.left = this.insertRecursive(node.left, value);
    } else if (comparison > 0) {
      node.right = this.insertRecursive(node.right, value);
    } else {
      return node; // Duplicate
    }

    node.height =
      1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
    const balance = this.getBalanceFactor(node);

    if (balance > 1 && this.comparator(value, node.left!.value) < 0) {
      return this.rotateRight(node);
    }

    if (balance < -1 && this.comparator(value, node.right!.value) > 0) {
      return this.rotateLeft(node);
    }

    if (balance > 1 && this.comparator(value, node.left!.value) > 0) {
      node.left = this.rotateLeft(node.left!);
      return this.rotateRight(node);
    }

    if (balance < -1 && this.comparator(value, node.right!.value) < 0) {
      node.right = this.rotateRight(node.right!);
      return this.rotateLeft(node);
    }

    return node;
  }

  private getHeight(node: AVLNode<T> | null): number {
    return node ? node.height : 0;
  }

  private getBalanceFactor(node: AVLNode<T>): number {
    return this.getHeight(node.left) - this.getHeight(node.right);
  }

  private rotateLeft(z: AVLNode<T>): AVLNode<T> {
    const y = z.right!;
    const T2 = y.left;

    y.left = z;
    z.right = T2;

    z.height = Math.max(this.getHeight(z.left), this.getHeight(z.right)) + 1;
    y.height = Math.max(this.getHeight(y.left), this.getHeight(y.right)) + 1;

    return y;
  }

  private rotateRight(z: AVLNode<T>): AVLNode<T> {
    const y = z.left!;
    const T3 = y.right;

    y.right = z;
    z.left = T3;

    z.height = Math.max(this.getHeight(z.left), this.getHeight(z.right)) + 1;
    y.height = Math.max(this.getHeight(y.left), this.getHeight(y.right)) + 1;

    return y;
  }
}
