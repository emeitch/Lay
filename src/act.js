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
    act.prev = this;
    return act;
  }
}
