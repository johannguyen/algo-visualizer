export const Color = {
  RED: "RED",
  BLACK: "BLACK",
} as const;
export type Color = (typeof Color)[keyof typeof Color];

export interface StepInfo<T> {
  description: string;
  tree: Node<T> | null;
}

class Node<T> {
  data: T;
  left: Node<T> | null = null;
  right: Node<T> | null = null;
  parent: Node<T> | null = null;
  color: Color = Color.RED;

  constructor(data: T) {
    this.data = data;
  }
}

export class RedBlackTree<T> {
  private root: Node<T> | null = null;
  private comparator: (a: T, b: T) => number;
  private steps: StepInfo<T>[] = [];

  constructor(comparator: (a: T, b: T) => number) {
    this.comparator = comparator;
  }

  public getSteps(): StepInfo<T>[] {
    return this.steps;
  }

  public insert(data: T): void {
    const newNode = new Node(data);
    this.root = this._bstInsert(this.root, newNode);
    this.recordStep(`Inserted ${this.label(data)} as RED`, this.root);
    this.fixInsert(newNode);
    this.recordStep(
      `✅ Final tree after inserting ${this.label(data)}`,
      this.root
    );
  }

  private _bstInsert(root: Node<T> | null, node: Node<T>): Node<T> {
    if (root === null) return node;

    this.recordStep(
      `🔍 Comparing ${this.label(node.data)} with ${this.label(root.data)}`,
      this.root
    );

    if (this.comparator(node.data, root.data) < 0) {
      root.left = this._bstInsert(root.left, node);
      root.left.parent = root;
    } else {
      root.right = this._bstInsert(root.right, node);
      root.right.parent = root;
    }
    return root;
  }

  private rotateLeft(x: Node<T>): void {
    const y = x.right;
    if (!y) return;
    this.recordStep(`🔄 Rotate left at ${this.label(x.data)}`, this.root);

    x.right = y.left;
    if (y.left) y.left.parent = x;
    y.parent = x.parent;
    if (!x.parent) this.root = y;
    else if (x === x.parent.left) x.parent.left = y;
    else x.parent.right = y;
    y.left = x;
    x.parent = y;
  }

  private rotateRight(y: Node<T>): void {
    const x = y.left;
    if (!x) return;
    this.recordStep(`🔄 Rotate right at ${this.label(y.data)}`, this.root);

    y.left = x.right;
    if (x.right) x.right.parent = y;
    x.parent = y.parent;
    if (!y.parent) this.root = x;
    else if (y === y.parent.left) y.parent.left = x;
    else y.parent.right = x;
    x.right = y;
    y.parent = x;
  }

  private fixInsert(z: Node<T>): void {
    while (z.parent && z.parent.color === Color.RED) {
      const parent = z.parent;
      const grandparent = parent.parent;
      if (!grandparent) break;

      if (parent === grandparent.left) {
        const uncle = grandparent.right;
        if (uncle && uncle.color === Color.RED) {
          this.recordStep(
            `🟥 Recoloring parent (${this.label(
              parent.data
            )}), uncle (${this.label(
              uncle.data
            )}), and grandparent (${this.label(grandparent.data)})`,
            this.root
          );
          parent.color = Color.BLACK;
          uncle.color = Color.BLACK;
          grandparent.color = Color.RED;
          z = grandparent;
        } else {
          if (z === parent.right) {
            z = parent;
            this.rotateLeft(z);
          }
          this.recordStep(
            `🟥 Recoloring and rotate right at grandparent (${this.label(
              grandparent.data
            )})`,
            this.root
          );
          parent.color = Color.BLACK;
          grandparent.color = Color.RED;
          this.rotateRight(grandparent);
        }
      } else {
        const uncle = grandparent.left;
        if (uncle && uncle.color === Color.RED) {
          this.recordStep(
            `🟥 Recoloring parent (${this.label(
              parent.data
            )}), uncle (${this.label(
              uncle.data
            )}), and grandparent (${this.label(grandparent.data)})`,
            this.root
          );
          parent.color = Color.BLACK;
          uncle.color = Color.BLACK;
          grandparent.color = Color.RED;
          z = grandparent;
        } else {
          if (z === parent.left) {
            z = parent;
            this.rotateRight(z);
          }
          this.recordStep(
            `🟥 Recoloring and rotate left at grandparent (${this.label(
              grandparent.data
            )})`,
            this.root
          );
          parent.color = Color.BLACK;
          grandparent.color = Color.RED;
          this.rotateLeft(grandparent);
        }
      }
    }
    this.root!.color = Color.BLACK;
  }

  private label(val: T): string {
    if (
      typeof val === "object" &&
      val !== null &&
      "label" in val &&
      typeof (val as { label: unknown }).label === "string"
    ) {
      return (val as { label: string }).label;
    }
    return JSON.stringify(val);
  }

  private recordStep(description: string, root: Node<T> | null): void {
    const deepClone = (node: Node<T> | null): Node<T> | null => {
      if (!node) return null;
      const newNode = new Node(node.data);
      newNode.color = node.color;
      newNode.left = deepClone(node.left);
      newNode.right = deepClone(node.right);
      return newNode;
    };
    this.steps.push({ description, tree: deepClone(root) });
  }
}

// ✅ Sync type export for use in .tsx
export type { Node as RBTNode };
