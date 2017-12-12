import Val from './val';
import Prim from './prim';
import Hash from './hash';
import { sym } from './sym';

export default class Comp extends Val {
  static valFrom(...args) {
    const origin = args.pop();

    if (origin instanceof Val) {
      return origin;
    }

    const head = sym(args.pop());
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
      if(origin.constructor === Object &&
         Object.keys(origin).length === 0) {
        return head;
      }
      return new Comp(origin, head);
    }

    throw `not supported origin: ${origin}`;
  }

  constructor(origin, head=undefined) {
    super(origin);
    this.head = head;
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

  get fields() {
    return this.origin;
  }

  get(key) {
    return this.constructor.valFrom(this.origin[key]);
  }

  merge(diff) {
    const o = Object.assign({}, this.origin, diff);
    return this.constructor(o, this.head);
  }

  collate(val) {
    if (val.constructor === this.constructor &&
        val.head.equals(this.head) &&
        Array.isArray(val.fields) &&
        Array.isArray(this.fields) &&
        val.fields.length === this.fields.length) {
          const result = {};
          let i = 0;
          for (const pat of this.fields) {
            const m = pat.collate(Comp.valFrom(val.fields[i]));
            Object.assign(result, m);
            i++;
          }
          Object.assign(result, {it: val});
          return result;
    }

    return super.collate(val);
  }
}
