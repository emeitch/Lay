import _ from 'lodash';
import Val from './val';
import Prim from './prim';
import Hash from './hash';
import Sym, { sym } from './sym';

export default class Comp extends Val {
  static valFrom(...args) {
    const origin = args.pop();
    const hsrc = args.pop();
    const head = hsrc instanceof Val ? hsrc : sym(hsrc);
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
      } else if (type === "object" && origin.constructor === Object) {
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
    this.head = head;
  }

  stringify(_indent=0) {
    const head = this.head.stringify() + " ";
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

  get fields() {
    return this.origin;
  }

  get tag() {
    return this.head;
  }

  get(k, book) {
    const key = k instanceof Sym || k instanceof Prim ? k.origin : k;

    if (this.origin.hasOwnProperty(key)) {
      return this.constructor.valFrom(this.origin[key]);
    }

    if (this.head instanceof Comp) {
      return this.head.get(key);
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
    return val.constructor === this.constructor && val.head.equals(this.head);
  }

  collate(val) {
    if (!this.sameType(val)) {
      return super.collate(val);
    }

    return this.origin.collate(Comp.valFrom(val.origin));
  }
}

export class CompArray extends Comp {
  constructor(origin, head) {
    super(origin, head || sym("Array"));
  }

  collate(val) {
    if (!this.sameType(val) || val.fields.length !== this.fields.length) {
      return super.collate(val);
    }

    const result = {};
    let i = 0;
    for (const pat of this.fields) {
      const m = pat.collate(Comp.valFrom(val.fields[i]));
      Object.assign(result, m);
      i++;
    }
    return result;
  }

  deepReduce(book) {
    const org = this.origin.map(i => i.deepReduce ? i.deepReduce(book) : i);
    return new this.constructor(org, this.head);
  }
}

export class CompMap extends Comp {
  constructor(origin, head) {
    super(origin, head || sym("Map"));
  }

  collate(val) {
    if (!this.sameType(val)) {
      return super.collate(val);
    }

    const result = {};
    for (const key of Object.keys(this.fields)) {
      const pat = this.fields[key];
      const m = pat.collate(Comp.valFrom(val.fields[key]));
      Object.assign(result, m);
    }
    return result;
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
