import Val from './val';

export default class Act extends Val {
  run() {
    let promise;
    if (this.prev) {
      promise = this.prev.run();
    } else {
      promise = Promise.resolve();
    }

    promise.then(this.origin);
    return promise;
  }

  and(act) {
    const a = new Act(act.origin);
    a.prev = this;
    return a;
  }
}
