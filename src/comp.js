import _ from 'lodash';
import Val from './val';
import Prim from './prim';
import Hash from './hash';
import Sym, { sym } from './sym';

const NullVal = new Prim(null);

export default class Comp extends Val {
  static valFrom(...args) {
    const origin = args.pop();
    const hsrc = args.pop() || null;
    const head = !hsrc || hsrc instanceof Val ? hsrc : new Prim(hsrc);
    const type = typeof(origin);

    if (!head && origin instanceof Val) {
      return origin;
    }

    if (head === null &&
        (type === "number" ||
         type === "string" ||
         type === "boolean" ||
         origin === null)) {
      return new Prim(origin);
    }

    if (head || origin) {
      let orgn;
      if (Array.isArray(origin)) {
        orgn = origin.map(val => val instanceof Prim ? val.origin : val);
        return new CompArray(orgn, head);
      } else if (type === "object" && origin && origin.constructor === Object) {
        orgn = {};
        for (const key of Object.keys(origin)) {
          const val = origin[key];
          orgn[key] = val instanceof Prim ? val.origin : val;
        }
        return new CompMap(orgn, head);
      }
      return new Comp(origin, head);
    }

    throw `not supported origin: ${origin}`;
  }


  constructor(origin, head) {
    super(origin);
    this.head = head || NullVal;
  }

  stringify(_indent=0) {
    const head = !this.head.equals(NullVal) ? this.head.stringify() + " " : "";
    return head + Val.stringify(this.origin, _indent);
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

  get field() {
    return Comp.valFrom(this.origin);
  }

  get(k, book) {
    const key = k instanceof Sym || k instanceof Prim ? k.origin : k;

    if (
      this.origin !== null
      && this.origin.hasOwnProperty(key)
    ) {
      return this.constructor.valFrom(this.origin[key]);
    }

    if (this.head instanceof Comp) {
      return this.head.get(key);
    }

    if (key === "head") {
      return this.head;
    }

    return super.get(k, book);
  }

  set(key, val) {
    const o = _.clone(this.origin);
    o[key] = val.origin;
    return this.constructor.valFrom(o);
  }

  merge(diff) {
    const o = Object.assign({}, this.origin, diff);
    return this.constructor(o, this.head);
  }

  sameType(val) {
    return (
      val.constructor === this.constructor
      && val.head.equals(this.head)
    );
  }

  collate(target) {
    if (!this.sameType(target)) {
      return super.collate(target);
    }

    return this.origin.collate(Comp.valFrom(target.origin));
  }

  object(book) {
    const o = super.object(book);
    if (!this.head.equals(NullVal)) {
      Object.assign(o, {head: this.head.object(book)});
    }
    return o;
  }
}

export class CompArray extends Comp {
  get class() {
     return sym("Array");
  }

  get jsObj() {
    return this.origin.map(val => {
      return val instanceof Val ? val.jsObj : val;
    });
  }

  collate(target) {
    if (!this.sameType(target) || this.origin.length !== this.origin.length) {
      return super.collate(target);
    }

    const result = {};
    let i = 0;
    for (const pat of this.origin) {
      const m = pat.collate(Comp.valFrom(target.origin[i]));
      Object.assign(result, m.result);
      i++;
    }
    return { pattern: this, target, result };
  }

  deepReduce(book) {
    const org = this.origin.map(i => i.deepReduce ? i.deepReduce(book) : i);
    return new this.constructor(org, this.head);
  }
}

export class CompMap extends Comp {
  get class() {
     return sym("Map");
  }

  get jsObj() {
    let ret = {};
    for (const key of Object.keys(this.origin)) {
      const val = this.origin[key];
      ret[key] = val instanceof Val ? val.jsObj : val;
    }
    return ret;
  }

  collate(target) {
    if (!this.sameType(target)) {
      return super.collate(target);
    }

    const result = {};
    for (const key of Object.keys(this.origin)) {
      const pat = this.origin[key];
      const m = pat.collate(Comp.valFrom(target.origin[key]));
      Object.assign(result, m.result);
    }
    return { pattern: this, target, result };
  }

  deepReduce(book) {
    const org = {};
    for (const key of Object.keys(this.origin)) {
      const val = this.origin[key];
      org[key] = val.deepReduce ? val.deepReduce(book) : val;
    }

    return new this.constructor(org, this.head);
  }
}
