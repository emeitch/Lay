import Val from './val';

export default class Act extends Val {
  constructor(
    executor=undefined,
    status="pending",
    val=undefined,
    next=undefined
  ) {
    super();
    this.executor = executor;
    this.status = status;
    this.val = val;
    this.next = next;
  }

  clone(update) {
    return Object.assign(new this.constructor(), this, update);
  }

  get pending() {
    return this.status === "pending";
  }

  get fulfilled() {
    return this.status === "fulfilled";
  }

  resolve(val) {
    return this.clone({status: "fulfilled", val});
  }

  _runWithArg(arg) {
    if (this.pending) {
      const val = this.executor(arg);
      if (val instanceof Act) {
        const act = val.clone();
        return act.chain(this.next);
      } else {
        return this.resolve(val);
      }
    } else {
      return this.next._runWithArg(this.val);
    }
  }

  run() {
    return this._runWithArg();
  }

  chain(act) {
    const next = this.next ? this.next.chain(act) : act;
    return this.clone({next});
  }
}
