import Val from './val';

export default class Act extends Val {
  run() {
    if (this.prev) {
      const promise = this.prev.run();
      promise.then(this.origin);
      return promise;
    } else {
      const promise = new Promise((resolve, _) => {
        this.origin();
        resolve();
      });
      return promise;
    }
  }

  and(act) {
    act.prev = this;
    return act;
  }
}
