import Val from './val';

const ActStatus = {
  PENDING: Symbol(),
  FULFILLED: Symbol(),
  REJECTED: Symbol(),
};

export default class Act extends Val {
  constructor(
    executor=undefined,
    status=ActStatus.PENDING,
    val=undefined,
    next=undefined,
    recovery=undefined
  ) {
    super();
    this.executor = executor;
    this.status = status;
    this.val = val;
    this.next = next;
    this.recovery = recovery;
    this.proceedOn = {
      [ActStatus.PENDING]: this._proceedOnPending,
      [ActStatus.FULFILLED]: this._proceedOnFulFilled,
      [ActStatus.REJECTED]: this._proceedOnRejected,
    };
  }

  clone(update) {
    return Object.assign(new this.constructor(), this, update);
  }

  get pending() {
    return this.status === ActStatus.PENDING;
  }

  get fulfilled() {
    return this.status === ActStatus.FULFILLED;
  }

  get rejected() {
    return this.status === ActStatus.REJECTED;
  }

  get settled() {
    return !this.pending;
  }

  resolve(val) {
    return this.clone({status: ActStatus.FULFILLED, val});
  }

  reject(val) {
    return this.clone({status: ActStatus.REJECTED, val});
  }

  _proceedOnPending(arg) {
    let val;
    try {
      val = this.executor(arg);
    } catch(err) {
      return this.reject(err);
    }

    if (val instanceof Act) {
      return val.then(this.next);
    } else {
      return this.resolve(val);
    }
  }

  _proceedOnFulFilled(_arg) {
    if (!this.next) {
      throw "next act not found error";
    }

    return this.next._proceedWithArg(this.val);
  }

  _proceedOnRejected(_arg) {
    if (this.recovery) {
      const act = this.recovery.then(this.next);
      return act._proceedWithArg(this.val);
    }

    if (!this.next) {
      throw "next act not found error";
    }

    return this.next.reject(this.val);
  }

  _proceedWithArg(arg) {
    const proc = this.proceedOn[this.status];
    if (!proc) {
      throw `can't proceed for unknown status: "${this.status}"`;
    }
    return proc.bind(this)(arg);
  }

  proceed() {
    return this._proceedWithArg();
  }

  then(act) {
    const next = this.next ? this.next.then(act) : act;
    return this.clone({next});
  }

  catch(recovery) {
    return this.clone({recovery});
  }
}
