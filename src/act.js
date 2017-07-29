import Val from './val';

export default class Act extends Val {
  static finish(status, val) {
    const act = new Act();
    act.status = status;
    act.val = val;
    return act;
  }

  static resolve(val) {
    return this.finish("fulfilled", val);
  }

  constructor(...args) {
    super(...args);
    this.status = "pending";
  }

  get pending() {
    return this.status === "pending";
  }

  get fulfilled() {
    return this.status === "fulfilled";
  }

  _runWithArg(arg) {
    if (this.pending) {
      const val = this.origin(arg);
      const act = val instanceof Act ? val : Act.resolve(val);
      act.chain(this.next);
      return act;
    } else {
      return this.next._runWithArg(this.val);
    }
  }

  run() {
    return this._runWithArg();
  }

  chain(act) {
    let last = this;
    while(last.next) {
      last = last.next;
    }
    last.next = act;

    return this;
  }
}
