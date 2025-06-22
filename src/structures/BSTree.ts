export class TreeNode<T> {
  value: T;
  left: TreeNode<T> | null = null;
  right: TreeNode<T> | null = null;

  constructor(value: T) {
    this.value = value;
  }
}

export class BSTree<T> {
  root: TreeNode<T> | null = null;
  comparator: (a: T, b: T) => number;

  constructor(comparator: (a: T, b: T) => number) {
    this.comparator = comparator;
  }

  clear(): void {
    this.root = null;
  }

  insert(value: T): void {
    const newNode = new TreeNode(value);
    if (!this.root) {
      this.root = newNode;
      return;
    }

    let current = this.root;
    while (true) {
      const cmp = this.comparator(value, current.value);
      if (cmp < 0) {
        if (!current.left) {
          current.left = newNode;
          return;
        }
        current = current.left;
      } else {
        if (!current.right) {
          current.right = newNode;
          return;
        }
        current = current.right;
      }
    }
  }

  searchPath(value: T): TreeNode<T>[] {
    const path: TreeNode<T>[] = [];
    let current = this.root;

    while (current) {
      path.push(current);
      const cmp = this.comparator(value, current.value);
      if (cmp === 0) break;
      current = cmp < 0 ? current.left : current.right;
    }

    return path;
  }
}
