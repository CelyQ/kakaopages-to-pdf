const MAX_CONCURRENT_TABS = 10;

export class TabQueue {
  private queue: (() => Promise<void>)[] = [];

  constructor(private maxConcurrentTabs: number = MAX_CONCURRENT_TABS) {}

  public async run(): Promise<void> {
    const promises: Promise<void>[] = [];

    for (let i = 0; i < this.maxConcurrentTabs; i++) {
      const fn = this.queue.shift();
      if (fn) {
        promises.push(fn());
      }
    }

    await Promise.all(promises);
  }

  public enqueue(fn: () => Promise<void>): void {
    this.queue.push(fn);
  }

  public get length(): number {
    return this.queue.length;
  }
}
