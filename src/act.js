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

  _proceedWithArg(arg) {
    if (this.pending) {
      let val;
      try {
        val = this.executor(arg);
      } catch(err) {
        return this.reject(err);
      }

      if (val instanceof Act) {
        const act = val.clone();
        return act.then(this.next);
      } else {
        return this.resolve(val);
      }
    } else if (this.fulfilled) {
      return this.next._proceedWithArg(this.val);
    } else if (this.rejected) {
      if (!this.next) {
        throw "next act not found error";
      }
      return this.next.reject(this.val);
    } else {
      // todo: CANCELEDやINPROGRESSなど様々なステータスで拡張できるようにする
      throw `can't proceed for unknown status: "${this.status}"`;
    }
  }

  proceed() {
    return this._proceedWithArg();
  }

  then(act) {
    const next = this.next ? this.next.then(act) : act;
    return this.clone({next});
  }
}
