export class ListenCount {
  private readonly valueInternal: number;

  private constructor(value: number) {
    this.valueInternal = value;
  }

  static from(totalListens: number): ListenCount {
    if (!Number.isFinite(totalListens)) {
      throw new TypeError('Listen count must be a finite number.');
    }

    if (!Number.isInteger(totalListens)) {
      throw new TypeError('Listen count must be an integer number of plays.');
    }

    if (totalListens < 0) {
      throw new RangeError('Listen count cannot be negative.');
    }

    return new ListenCount(totalListens);
  }

  get value(): number {
    return this.valueInternal;
  }

  add(other: ListenCount): ListenCount {
    return new ListenCount(this.valueInternal + other.valueInternal);
  }

  subtract(other: ListenCount): number {
    return this.valueInternal - other.valueInternal;
  }

  compare(other: ListenCount): number {
    return this.valueInternal - other.valueInternal;
  }

  equals(other: ListenCount): boolean {
    return this.valueInternal === other.valueInternal;
  }
}
