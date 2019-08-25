import _ from 'lodash';

import Val from './val';
import Prim from './prim';
import v from './v';

export default class Comp extends Val {
  static valFrom(...args) {
    const origin = args.pop();
    const typesrc = args.pop() || null;
    const type = !typesrc || typesrc instanceof Val ? typesrc : new Prim(typesrc);
    const jstype = typeof(origin);

    if (!type && origin instanceof Val) {
      return origin;
    }

    if (type === null &&
        (jstype === "number" ||
         jstype === "string" ||
         jstype === "boolean" ||
         origin === null)) {
      return new Prim(origin);
    }

    if (type || origin) {
      let orgn;
      if (Array.isArray(origin)) {
        orgn = origin.map(val => val instanceof Prim ? val.origin : val);
        return new CompArray(orgn, type);
      } else if (jstype === "object" && origin && origin.constructor === Object) {
        orgn = {};
        for (const key of Object.keys(origin)) {
          const val = origin[key];
          orgn[key] = val instanceof Prim ? val.origin : val;
        }
        return new CompMap(orgn, type);
      } else if (jstype === "object" && origin && origin.constructor === Date) {
        return new CompDate(origin, type);
      }
      return new Comp(origin, type);
    }

    throw `not supported origin: ${origin}`;
  }

  stringify(_indent=0) {
    const type = this.getOwnProp("_type");
    const typestr = type.equals(v("Map")) ? "" : type.origin + " ";
    const originstr = Object.assign({}, this.origin);
    delete originstr._type;
    return typestr + Val.stringify(originstr, _indent);
  }

  get reducible() {
    return false;
  }

  get field() {
    return Comp.valFrom(this.origin);
  }

  getCompProp(key) {
    const kstr = this.convertKeyString(key);
    if (this.origin !== null && this.origin.hasOwnProperty(kstr)) {
      return this.constructor.valFrom(this.origin[kstr]);
    }

    return undefined;
  }

  getOwnProp(k) {
    const prop = this.getCompProp(k);
    if (prop) {
      return prop;
    }

    return super.getOwnProp(k);
  }

  get(k, store) {
    const key = v(k);

    if (store) {
      const pth = store.path(this, key);
      if (pth.isInner()) {
        return store.fetch(pth) || pth;
      }
    }

    let ownProp = this.getOwnProp(key);
    if (ownProp) {
      const base = this.getOwnProp("_id");
      if (store && base && ownProp instanceof CompMap) {
        const _id = store.path(base, key).keyString();
        return ownProp.patch({_id});
      }
      return ownProp;
    }

    return super.get(key, store);
  }

  patch(diff) {
    let d = Comp.valFrom(diff).origin;

    const remove = obj => {
      for (const k of Object.keys(obj)) {
        const prop = obj[k];
        if (prop === null || (prop.equals && prop.equals(Comp.valFrom(null)))) {
          delete obj[k];
        }

        if (typeof(prop) === "object" && prop !== null && !(prop instanceof Val)) {
          remove(prop);
        }
      }
      return obj;
    };

    const oo = Object.assign({}, this.origin);
    const newObj = remove(_.merge(oo, d));
    return new this.constructor(newObj);
  }

  sameType(val) {
    return val.constructor === this.constructor;
  }

  collate(target) {
    if (!this.sameType(target)) {
      return super.collate(target);
    }

    return this.origin.collate(Comp.valFrom(target.origin));
  }
}

export class CompArray extends Comp {
  get typeName() {
     return "Array";
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

  object(store) {
    const o = super.object(store);
    o.origin = this.origin.map(o => o instanceof Val ? o.object(store) : o);
    return o;
  }
}

export class CompMap extends Comp {
  constructor(origin, type) {
    const o = Object.assign({}, origin, type ? {_type: type}: undefined);
    super(o);
  }

  get typeName() {
     return "Map";
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

    if (!this.getOwnProp("_type").equals(target.getOwnProp("_type"))) {
      return { pattern: this, result: null };
    }

    const result = {};
    for (const key of Object.keys(this.origin)) {
      if (key[0] === "_") {
        continue;
      }
      const pat = this.getOwnProp(key);
      const m = pat.collate(Comp.valFrom(target.origin[key]));
      Object.assign(result, m.result);
    }
    return { pattern: this, target, result };
  }

  step(store) {
    const body = this.getOwnProp("_body");
    return body ? body.step(store) : super.step(store);
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

  keyString() {
    const id = this.get("_id");
    return id ? id.keyString() : super.keyString();
  }
}

export class CompDate extends Comp {
  get typeName() {
     return "Date";
  }

  object(store) {
    const o = super.object(store);
    return Object.assign(o, {
      origin: this.origin.toISOString()
    });
  }
}
