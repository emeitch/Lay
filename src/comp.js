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
      } else if (type === "object" && origin && origin.constructor === Date) {
        return new CompDate(origin, head);
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

  getOwnProp(k) {
    const key = k instanceof Sym || k instanceof Prim ? k.origin : k;

    if (this.origin !== null && this.origin.hasOwnProperty(key)) {
      return this.constructor.valFrom(this.origin[key]);
    }

    return super.getOwnProp(k);
  }

  get(k, store) {
    const key = k instanceof Sym || k instanceof Prim ? k.origin : k;

    const ownProp = this.getOwnProp(k);
    if (ownProp) {
      return ownProp;
    }

    if (this.head instanceof Comp) {
      return this.head.get(key);
    }

    if (key === "head") {
      return this.head;
    }

    if (store) {
      return store.findPropFromType(this, key);
    }

    return super.get(k, store);
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

  object(store) {
    const o = super.object(store);
    if (!this.head.equals(NullVal)) {
      o._head = this.head.object(store);
    }
    return o;
  }
}

export class CompArray extends Comp {
  get type() {
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

  deepReduce(store) {
    const org = this.origin.map(i => i.deepReduce ? i.deepReduce(store) : i);
    return new this.constructor(org, this.head);
  }

  object(store) {
    const o = super.object(store);
    o.origin = this.origin.map(o => o instanceof Val ? o.object(store) : o);
    return o;
  }
}

export class CompMap extends Comp {
  get type() {
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

  constructor(origin, head) {
    if (origin._id && typeof(origin._id) === "string") {
      origin._id = sym(origin._id);
    }

    super(origin, head);
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

  step(store) {
    const target = this.getOwnProp("_target");
    return target ? target.step(store) : super.step(store);
  }

  deepReduce(store) {
    const org = {};
    for (const key of Object.keys(this.origin)) {
      const val = this.origin[key];
      org[key] = val.deepReduce ? val.deepReduce(store) : val;
    }

    return new this.constructor(org, this.head);
  }

  object(store) {
    const o = super.object(store);
    delete o.origin;

    for (const key of Object.keys(this.origin)) {
      const val = this.origin[key];
      o[key] = val instanceof Val ? val.object(store) : val;
    }

    return o;
  }
}

export class CompDate extends Comp {
  get type() {
     return sym("Date");
  }

  object(store) {
    const o = super.object(store);
    return Object.assign(o, {
      origin: this.origin.toISOString()
    });
  }
}
