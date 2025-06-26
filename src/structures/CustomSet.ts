// src/structures/CustomSet.ts

export type CustomSetStep = {
  table: string[][];
  bucketIndex?: number;
  message: string;
  highlightValue?: string;
  compareIndices?: number[];
};

export type CustomSetConfig = {
  size: number;
  hashFunc: (value: string, size: number) => number;
};

export class CustomSet {
  table: string[][];
  config: CustomSetConfig;

  constructor(config: CustomSetConfig, initial?: readonly string[]) {
    this.config = config;
    this.table = Array.from({ length: config.size }, () => []);
    if (initial) {
      for (const value of initial) {
        this.add(value);
      }
    }
  }

  cloneTable(): string[][] {
    return this.table.map(bucket => [...bucket]);
  }

  add(value: string): CustomSetStep[] {
    const steps: CustomSetStep[] = [];
    const idx = this.config.hashFunc(value, this.config.size);

    steps.push({
      table: this.cloneTable(),
      bucketIndex: idx,
      message: `Hash for "${value}" is ${idx}. Bucket before: [${this.table[idx].join(", ")}]`,
      highlightValue: value,
      compareIndices: [],
    });

    for (let i = 0; i < this.table[idx].length; i++) {
      const v = this.table[idx][i];
      steps.push({
        table: this.cloneTable(),
        bucketIndex: idx,
        message: `Compare "${value}" with bucket[${i}] = "${v}".`,
        highlightValue: value,
        compareIndices: [i],
      });
      if (v === value) {
        steps.push({
          table: this.cloneTable(),
          bucketIndex: idx,
          message: `"${value}" already exists in bucket ${idx}, so no insertion.`,
          highlightValue: value,
          compareIndices: [i],
        });
        return steps;
      }
    }

    this.table[idx].push(value);
    steps.push({
      table: this.cloneTable(),
      bucketIndex: idx,
      message: `Inserted "${value}" into bucket ${idx}. Bucket now: [${this.table[idx].join(", ")}]`,
      highlightValue: value,
      compareIndices: [],
    });

    return steps;
  }

  contains(value: string): CustomSetStep[] {
    const steps: CustomSetStep[] = [];
    const idx = this.config.hashFunc(value, this.config.size);

    steps.push({
      table: this.cloneTable(),
      bucketIndex: idx,
      message: `Hash for "${value}" is ${idx}. Bucket: [${this.table[idx].join(", ")}]`,
      highlightValue: value,
      compareIndices: [],
    });

    for (let i = 0; i < this.table[idx].length; i++) {
      const v = this.table[idx][i];
      steps.push({
        table: this.cloneTable(),
        bucketIndex: idx,
        message: `Compare "${value}" with bucket[${i}] = "${v}".`,
        highlightValue: value,
        compareIndices: [i],
      });
      if (v === value) {
        steps.push({
          table: this.cloneTable(),
          bucketIndex: idx,
          message: `"${value}" found in bucket ${idx}.`,
          highlightValue: value,
          compareIndices: [i],
        });
        return steps;
      }
    }
    steps.push({
      table: this.cloneTable(),
      bucketIndex: idx,
      message: `"${value}" not found in bucket ${idx}.`,
      highlightValue: value,
      compareIndices: [],
    });
    return steps;
  }

  remove(value: string): CustomSetStep[] {
    const steps: CustomSetStep[] = [];
    const idx = this.config.hashFunc(value, this.config.size);

    steps.push({
      table: this.cloneTable(),
      bucketIndex: idx,
      message: `Hash for "${value}" is ${idx}. Bucket before: [${this.table[idx].join(", ")}]`,
      highlightValue: value,
      compareIndices: [],
    });

    for (let i = 0; i < this.table[idx].length; i++) {
      const v = this.table[idx][i];
      steps.push({
        table: this.cloneTable(),
        bucketIndex: idx,
        message: `Compare "${value}" with bucket[${i}] = "${v}".`,
        highlightValue: value,
        compareIndices: [i],
      });
      if (v === value) {
        this.table[idx].splice(i, 1);
        steps.push({
          table: this.cloneTable(),
          bucketIndex: idx,
          message: `Deleted "${value}" from bucket ${idx}. Bucket after: [${this.table[idx].join(", ")}]`,
          highlightValue: value,
          compareIndices: [],
        });
        return steps;
      }
    }
    steps.push({
      table: this.cloneTable(),
      bucketIndex: idx,
      message: `"${value}" not found in bucket ${idx}. Nothing deleted.`,
      highlightValue: value,
      compareIndices: [],
    });
    return steps;
  }
}
