import Val from './val';

export default class Act extends Val {
  run() {
    if (this.prev) {
      const prevExecuted = this.prev.run();
      if (prevExecuted) {
        this.prev = undefined;
      }
      return false;
    } else {
      this.origin();
      return true;
    }
  }

  and(act) {
    const a = new Act(act.origin);
    a.prev = this;
    return a;
  }
}
