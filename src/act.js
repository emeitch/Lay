import Val from './val';

const ActStatus = {
  PENDING: Symbol(),
  FULFILLED: Symbol()
};

export default class Act extends Val {
  constructor(
    executor=undefined,
    status=ActStatus.PENDING,
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
    return this.status === ActStatus.PENDING;
  }

  get fulfilled() {
    return this.status === ActStatus.FULFILLED;
  }

  get settled() {
    return !this.pending;
  }

  resolve(val) {
    return this.clone({status: ActStatus.FULFILLED, val});
  }

  _proceedWithArg(arg) {
    if (this.pending) {
      const val = this.executor(arg);
      if (val instanceof Act) {
        const act = val.clone();
        return act.chain(this.next);
      } else {
        return this.resolve(val);
      }
    } else {
      return this.next._proceedWithArg(this.val);
    }
  }

  proceed() {
    return this._proceedWithArg();
  }

  chain(act) {
    const next = this.next ? this.next.chain(act) : act;
    return this.clone({next});
  }
}
