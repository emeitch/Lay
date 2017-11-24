import Val from './val';
import Prim from './prim';
import Hash from './hash';

export default class Comp extends Val {
  static valFrom(origin) {
    const type = typeof(origin);

    if (type === "number" ||
        type === "string" ||
        type === "boolean") {
      return new Prim(origin);
    }

    if (Array.isArray(origin) ||
        (type === "object" &&
         (origin.constructor === Object ||
          origin.constructor === Date))) { // todo:DateはJSではなくLay側の型・クラスに変更したい
      return new Comp(origin);
    }

    throw `not supported origin: ${origin}`;
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
