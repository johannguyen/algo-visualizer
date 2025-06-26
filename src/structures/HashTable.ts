// src/structures/HashTable.ts

export type HashEntry = { key: string; value?: string };
export type HashTableStep = {
  table: HashEntry[][];
  bucketIndex?: number;
  message: string;
  highlightKey?: string;
};

export type HashTableConfig = {
  size: number;
  hashFunc: (key: string, size: number) => number;
};

export class HashTable {
  table: HashEntry[][];
  config: HashTableConfig;

  constructor(config: HashTableConfig, initial?: readonly string[]) {
    this.config = config;
    this.table = Array.from({ length: config.size }, () => []);
    if (initial) {
      for (const key of initial) {
        this.insert(key);
      }
    }
  }

  cloneTable(): HashEntry[][] {
    return this.table.map((bucket) => bucket.map((entry) => ({ ...entry })));
  }

  insert(key: string): HashTableStep[] {
    const steps: HashTableStep[] = [];
    const idx = this.config.hashFunc(key, this.config.size);

    // Step 1: hash and show current bucket content
    steps.push({
      table: this.cloneTable(),
      bucketIndex: idx,
      message: `Hash for "${key}" is ${idx}. Bucket before: [${this.table[idx]
        .map((e) => e.key)
        .join(", ")}]`,
      highlightKey: key,
    });

    if (this.table[idx].some((entry) => entry.key === key)) {
      steps.push({
        table: this.cloneTable(),
        bucketIndex: idx,
        message: `"${key}" already exists in bucket ${idx}. No insertion.`,
        highlightKey: key,
      });
      return steps;
    }

    // Step 2: Insert and show after state
    this.table[idx].push({ key });
    steps.push({
      table: this.cloneTable(),
      bucketIndex: idx,
      message: `Inserted "${key}" into bucket ${idx}. Bucket after: [${this.table[
        idx
      ]
        .map((e) => e.key)
        .join(", ")}]`,
      highlightKey: key,
    });
    return steps;
  }

  search(key: string): HashTableStep[] {
    const steps: HashTableStep[] = [];
    const idx = this.config.hashFunc(key, this.config.size);

    // Step 1: hash and show current bucket content
    steps.push({
      table: this.cloneTable(),
      bucketIndex: idx,
      message: `Hash for "${key}" is ${idx}. Bucket: [${this.table[idx]
        .map((e) => e.key)
        .join(", ")}]`,
      highlightKey: key,
    });

    if (this.table[idx].some((entry) => entry.key === key)) {
      steps.push({
        table: this.cloneTable(),
        bucketIndex: idx,
        message: `"${key}" found in bucket ${idx}.`,
        highlightKey: key,
      });
    } else {
      steps.push({
        table: this.cloneTable(),
        bucketIndex: idx,
        message: `"${key}" not found in bucket ${idx}.`,
        highlightKey: key,
      });
    }
    return steps;
  }

  delete(key: string): HashTableStep[] {
    const steps: HashTableStep[] = [];
    const idx = this.config.hashFunc(key, this.config.size);

    // Step 1: hash and show before
    steps.push({
      table: this.cloneTable(),
      bucketIndex: idx,
      message: `Hash for "${key}" is ${idx}. Bucket before: [${this.table[idx]
        .map((e) => e.key)
        .join(", ")}]`,
      highlightKey: key,
    });

    if (!this.table[idx].some((entry) => entry.key === key)) {
      steps.push({
        table: this.cloneTable(),
        bucketIndex: idx,
        message: `"${key}" not found in bucket ${idx}. Nothing deleted.`,
        highlightKey: key,
      });
      return steps;
    }

    // Step 2: Remove and show after
    this.table[idx] = this.table[idx].filter((entry) => entry.key !== key);
    steps.push({
      table: this.cloneTable(),
      bucketIndex: idx,
      message: `Deleted "${key}" from bucket ${idx}. Bucket after: [${this.table[
        idx
      ]
        .map((e) => e.key)
        .join(", ")}]`,
      highlightKey: key,
    });
    return steps;
  }
}
