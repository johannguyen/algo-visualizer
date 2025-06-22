// src/structures/BinaryTree.ts
export class TreeNode<T> {
  value: T;
  left: TreeNode<T> | null = null;
  right: TreeNode<T> | null = null;

  constructor(value: T) {
    this.value = value;
  }
}

export class BinaryTree<T> {
  root: TreeNode<T> | null = null;

  insert(value: T): void {
    const newNode = new TreeNode(value);
    if (!this.root) {
      this.root = newNode;
      return;
    }

    const queue: TreeNode<T>[] = [this.root];
    while (queue.length) {
      const node = queue.shift()!;
      if (!node.left) {
        node.left = newNode;
        return;
      } else if (!node.right) {
        node.right = newNode;
        return;
      } else {
        queue.push(node.left);
        queue.push(node.right);
      }
    }
  }

  traverse(order: "preorder" | "inorder" | "postorder"): T[] {
    const result: T[] = [];

    const dfs = (node: TreeNode<T> | null) => {
      if (!node) return;

      if (order === "preorder") result.push(node.value);
      dfs(node.left);
      if (order === "inorder") result.push(node.value);
      dfs(node.right);
      if (order === "postorder") result.push(node.value);
    };

    dfs(this.root);
    return result;
  }

  clear(): void {
    this.root = null;
  }
}
