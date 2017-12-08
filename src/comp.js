import Val from './val';
import Prim from './prim';
import Hash from './hash';
import { sym } from './sym';

export default class Comp extends Val {
  static valFrom(...args) {
    const origin = args.pop();
    const head = args.pop();
    const type = typeof(origin);

    if (head === undefined &&
        (type === "number" ||
         type === "string" ||
         type === "boolean" ||
         origin === null)) {
      return new Prim(origin);
    }

    if (Array.isArray(origin) ||
        (type === "object" &&
         (origin.constructor === Object ||
          origin.constructor === Date))) { // todo:DateはJSではなくLay側の型・クラスに変更したい
      return new Comp(origin, head);
    }

    throw `not supported origin: ${origin}`;
  }

  constructor(origin, head=undefined) {
    super(origin);
    
    if (head) {
      this.head = sym(head);
    }
  }

  get hash() {
    return new Hash(this.origin);
  }

  get id() {
    return this.hash;
  }

  get reducible() {
    return false;
  }

  get(key) {
    return this.constructor.valFrom(this.origin[key]);
  }
}
