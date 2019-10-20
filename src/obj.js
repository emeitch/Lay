import _ from 'lodash';

import Val from './val';
import { path } from './path';
import v from './v';

export default class Obj extends Val {
  constructor(origin, protoName) {
    const o = Object.assign({}, origin, protoName ? {_proto: protoName}: undefined);
    super(o);
  }

  get protoName() {
     return "Obj";
  }

  get jsObj() {
    let ret = {};
    for (const key of this.keys) {
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

  getOriginProp(key) {
    const kstr = this.convertKeyString(key);
    const hasProp = Object.prototype.hasOwnProperty.call(this.origin, kstr);
    return hasProp ? v(this.origin[kstr]) : undefined;
  }

  getOwnProp(key) {
    return this.getOriginProp(key) || super.getOwnProp(key);
  }

  get(k, store) {
    const key = v(k);

    if (store) {
      const pth = store.path(this, key);
      if (pth.isInner()) {
        return store.fetch(pth) || pth;
      }
    }

    const ownProp = this.getOriginProp(key);
    if (ownProp) {
      const base = this.getOriginProp("_id");
      if (store && base && ownProp instanceof Obj) {
        const _id = store.path(base, key).keyString();
        return ownProp.patch({_id});
      }
      return ownProp;
    }

    const superProp = super.get(key, store);
    if (superProp) {
      return superProp;
    }

    // parent chain
    if (store) {
      const parent = this.parent(store);
      if (parent) {
        const parentProp = parent.get(key, store);
        if (parentProp) {
          return parentProp;
        }
      }
    }

    return undefined;
  }

  collate(target) {
    if (this.constructor !== target.constructor) {
      return super.collate(target);
    }

    if (!this.getOwnProp("_proto").equals(target.getOwnProp("_proto"))) {
      return { pattern: this, result: null };
    }

    const result = {};
    for (const key of this.keys) {
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

    for (const key of this.keys) {
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
    const protoName = this.getOwnProp("_proto");
    const protoStr = protoName.equals(v("Obj")) ? "" : protoName.origin + " ";
    const originstr = Object.assign({}, this.origin);
    delete originstr._proto;
    return protoStr + Val.stringify(originstr, _indent);
  }

  parent(store) {
    const pth = path(this).parent();
    return pth ? store.fetch(pth) : undefined;
  }

  _onPut(store) {
    const recursiveOnPutByProto = (obj, pth) => {
      const func = obj.get("onPutByProto", store);
      const protoId = pth.keyString();
      const parent = func.bind(obj)(protoId);

      return parent.keys.reduce((o, k) => {
        const child = o.get(k);
        const p = pth.child(k);
        if (child instanceof Obj) {
          return o.patch({[k]: recursiveOnPutByProto(child, p).origin});
        } else {
          return o;
        }
      }, parent);
    };

    return recursiveOnPutByProto(this, path(this));
  }

  equals(other) {
    if (other.constructor !== this.constructor) {
      return false;
    }

    const removeMetadataOrigin = obj => {
      const orig = Object.assign({}, obj.origin);
      for (const key of Object.keys(obj.origin)) {
        if (key.match(/^_/)) {
          delete orig[key];
        }
      }
      return orig;
    };

    return _.isEqual(removeMetadataOrigin(this), removeMetadataOrigin(other));
  }
}
