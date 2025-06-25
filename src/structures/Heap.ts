// src/structures/Heap.ts

/**
 * An interface describing a single step in a heap operation,
 * used for visualization purposes.
 */
export interface HeapStep<T> {
  heapState: T[];
  description: string;
  highlights: { [index: number]: string };
}

/**
 * A generic Heap (Priority Queue) that can store any data type.
 */
export class Heap<T> {
  private data: T[] = [];
  private steps: HeapStep<T>[] = [];
  private compare: (a: T, b: T) => number;

  constructor(comparator: (a: T, b: T) => number) {
    this.compare = comparator;
  }

  // --- Private Helper Methods (Unchanged) ---
  private getParentIndex(i: number): number {
    return Math.floor((i - 1) / 2);
  }
  private getLeftChildIndex(i: number): number {
    return 2 * i + 1;
  }
  private getRightChildIndex(i: number): number {
    return 2 * i + 2;
  }
  private swap(i1: number, i2: number): void {
    [this.data[i1], this.data[i2]] = [this.data[i2], this.data[i1]];
  }

  // --- Core Public API (Unchanged from previous fix) ---
  public insert(value: T): void {
    this.steps = [];
    this.data.push(value);
    this.steps.push({
      heapState: [...this.data],
      description: `Inserting ${JSON.stringify(value)}. Placed at the end.`,
      highlights: { [this.data.length - 1]: "inserted" },
    });
    this.heapifyUp(this.data.length - 1);
  }

  public extractRoot(): T | undefined {
    this.steps = [];
    if (this.data.length === 0) return undefined;
    const initialState = [...this.data];
    const root = this.data[0];
    this.steps.push({
      heapState: initialState,
      description: `Extracting root: ${JSON.stringify(root)}.`,
      highlights: { 0: "swapping" },
    });
    const last = this.data.pop();
    if (this.data.length > 0 && last !== undefined) {
      this.data[0] = last;
      this.steps.push({
        heapState: [...this.data],
        description: `Move last element (${JSON.stringify(last)}) to the root.`,
        highlights: { 0: "inserted" },
      });
      this.heapifyDown(0);
    } else {
      this.steps.push({
        heapState: [],
        description: `Heap is now empty.`,
        highlights: {},
      });
    }
    return root;
  }

  // --- Internal Heapify Logic (heapifyUp is unchanged) ---
  private heapifyUp(index: number): void {
    let currentIndex = index;
    let parentIndex = this.getParentIndex(currentIndex);
    while (
      currentIndex > 0 &&
      this.compare(this.data[currentIndex], this.data[parentIndex]) < 0
    ) {
      this.steps.push({
        heapState: [...this.data],
        description: `Comparing child (${JSON.stringify(
          this.data[currentIndex]
        )}) with parent (${JSON.stringify(
          this.data[parentIndex]
        )}). Child has higher priority.`,
        highlights: { [currentIndex]: "comparing", [parentIndex]: "comparing" },
      });
      this.swap(currentIndex, parentIndex);
      this.steps.push({
        heapState: [...this.data],
        description: `Swap complete.`,
        highlights: { [parentIndex]: "inserted", [currentIndex]: "finalized" },
      });
      currentIndex = parentIndex;
      parentIndex = this.getParentIndex(currentIndex);
    }
    this.steps.push({
      heapState: [...this.data],
      description: `Heap property is satisfied. Element is in its final position.`,
      highlights: { [currentIndex]: "finalized" },
    });
  }

  // --- HEAPIFY DOWN (UPDATED WITH MORE DESCRIPTIVE STEPS) ---
  private heapifyDown(index: number): void {
    let currentIndex = index;

    while (this.getLeftChildIndex(currentIndex) < this.data.length) {
      const leftChildIndex = this.getLeftChildIndex(currentIndex);
      const rightChildIndex = this.getRightChildIndex(currentIndex);
      let highPriorityChildIndex = leftChildIndex;

      // --- NEW STEP 1: Compare children (if two exist) ---
      if (rightChildIndex < this.data.length) {
        this.steps.push({
          heapState: [...this.data],
          description: `Comparing left child with right child to find which has higher priority.`,
          highlights: {
            [leftChildIndex]: "comparing",
            [rightChildIndex]: "comparing",
          },
        });
        if (
          this.compare(this.data[rightChildIndex], this.data[leftChildIndex]) <
          0
        ) {
          highPriorityChildIndex = rightChildIndex;
        }
      }

      // --- NEW STEP 2: Compare parent with the chosen child ---
      this.steps.push({
        heapState: [...this.data],
        description: `Comparing parent with its highest-priority child (${JSON.stringify(
          this.data[highPriorityChildIndex]
        )}).`,
        highlights: {
          [currentIndex]: "comparing",
          [highPriorityChildIndex]: "comparing",
        },
      });

      if (
        this.compare(
          this.data[highPriorityChildIndex],
          this.data[currentIndex]
        ) < 0
      ) {
        // --- NEW STEP 3: Announce and perform swap ---
        this.steps.push({
          heapState: [...this.data],
          description: `Parent has lower priority. Swapping parent with child.`,
          highlights: {
            [currentIndex]: "swapping",
            [highPriorityChildIndex]: "swapping",
          },
        });

        this.swap(currentIndex, highPriorityChildIndex);
        currentIndex = highPriorityChildIndex;
      } else {
        // Parent is in the correct place, stop.
        this.steps.push({
          heapState: [...this.data],
          description:
            "Parent already has higher priority. Heap property is satisfied for this subtree.",
          highlights: { [currentIndex]: "finalized" },
        });
        return;
      }
    }
    // Final step if the element sinks all the way to a leaf position.
    this.steps.push({
      heapState: [...this.data],
      description: "Element has settled into its final leaf position.",
      highlights: { [currentIndex]: "finalized" },
    });
  }

  // --- Public Accessors (Unchanged) ---
  public getSteps(): HeapStep<T>[] {
    return this.steps;
  }
  public getComparator(): (a: T, b: T) => number {
    return this.compare;
  }
  public size(): number {
    return this.data.length;
  }
  public cloneEmpty(): Heap<T> {
    return new Heap<T>(this.compare);
  }
  public getData(): readonly T[] {
    return [...this.data];
  }
}
