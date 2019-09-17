import _ from 'lodash';

import Val from './val';
import v from './v';

export default class Obj extends Val {
  constructor(origin, type) {
    const o = Object.assign({}, origin, type ? {_proto: type}: undefined);
    super(o);
  }

  get typeName() {
     return "Obj";
  }

  get jsObj() {
    let ret = {};
    for (const key of Object.keys(this.origin)) {
      const val = this.origin[key];
      ret[key] = val instanceof Val ? val.jsObj : val;
    }
    return ret;
  }

  get keys() {
    return Object.keys(this.origin);
  }

  clone() {
    return new this.constructor(this.origin);
  }

  getOriginProperty(key) {
    const kstr = this.convertKeyString(key);
    const hasProp = Object.prototype.hasOwnProperty.call(this.origin, kstr);
    return hasProp ? v(this.origin[kstr]) : undefined;
  }

  getOwnProp(key) {
    return this.getOriginProperty(key) || super.getOwnProp(key);
  }

  get(k, store) {
    const key = v(k);

    if (store) {
      const pth = store.path(this, key);
      if (pth.isInner()) {
        return store.fetch(pth) || pth;
      }
    }

    const ownProp = this.getOriginProperty(key);
    if (ownProp) {
      const base = this.getOriginProperty("_id");
      if (store && base && ownProp instanceof Obj) {
        const _id = store.path(base, key).keyString();
        return ownProp.patch({_id});
      }
      return ownProp;
    }

    return super.get(key, store);
  }

  collate(target) {
    if (this.constructor !== target.constructor) {
      return super.collate(target);
    }

    if (!this.getOwnProp("_proto").equals(target.getOwnProp("_proto"))) {
      return { pattern: this, result: null };
    }

    const result = {};
    for (const key of Object.keys(this.origin)) {
      if (key[0] === "_") {
        continue;
      }
      const pat = this.getOwnProp(key);
      const m = pat.collate(v(target.origin[key]));
      Object.assign(result, m.result);
    }
    return { pattern: this, target, result };
  }

  patch(diff) {
    let d = v(diff).origin;

    const remove = obj => {
      for (const k of Object.keys(obj)) {
        const prop = obj[k];
        if (prop === null || (prop.equals && prop.equals(v(null)))) {
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

  stringify(_indent=0) {
    const type = this.getOwnProp("_proto");
    const typestr = type.equals(v("Obj")) ? "" : type.origin + " ";
    const originstr = Object.assign({}, this.origin);
    delete originstr._proto;
    return typestr + Val.stringify(originstr, _indent);
  }
}
