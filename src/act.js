import Val from './val';

const ActStatus = {
  PENDING: Symbol(),
  FULFILLED: Symbol(),
  REJECTED: Symbol(),
};

export default class Act extends Val {
  constructor(
    executor=null,
    status=ActStatus.PENDING,
    val=null,
    next=null,
    recovery=null
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

  get statusName() {
    for (const key of Object.keys(ActStatus)) {
      if (this.status === ActStatus[key]) {
        return key;
      }
    }

    return null;
  }

  resolve(val) {
    let next = this.next;
    if (val instanceof Act) {
      next = val.then(next);
      val = null;
    }

    return this.clone({status: ActStatus.FULFILLED, val, next});
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

    return this.resolve(val);
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

  proceed(arg) {
    return this._proceedWithArg(arg);
  }

  then(act) {
    const next = this.next ? this.next.then(act) : act;
    return this.clone({next});
  }

  catch(recovery) {
    return this.clone({recovery});
  }

  _then(...args) {
    return this.then(...args);
  }

  deepReduce(book) {
    return this.clone({
      next: this.next ? this.next.reduce(book).deepReduce(book) : this.next,
      recovery: this.recovery ? this.recovery.reduce(book).deepReduce(book) : this.recovery
    });
  }

  stringify(indent) {
    return `<Act executor: ${this.appendIndent(this.executor, indent)}, status: ${this.statusName}, val: ${this.val}>`;
  }
}
