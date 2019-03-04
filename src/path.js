import Val from './val';
import Prim from './prim';
import Case from './case';
import v from './v';
import Sym from './sym';
import { exp } from './exp';
import { func, LiftedNative } from './func';

export default class Path extends Val {
  constructor(...ids) {
    const origin = ids.reduce((acc, id, index) => {
      if (typeof(id) === "string") {
        id = v(id);
      }

      const idProp = id.getOwnProp && id.getOwnProp("_id");
      if (idProp) {
        const pth = Path.parse(idProp);
        if (index === 0) {
          id = pth;
        } else {
          if (pth.isMultiple()) {
            throw 'cannot contains a object with a path id for keys';
          }
          id = idProp;
        }
      }

      if (Array.isArray(id)) {
        const arr = id;
        const applying = arr.map(i => typeof(i) === "string" ? v(i) : i);
        const val = index == 0 ? exp(...arr) : applying;
        return acc.concat([val]);
      } else if (index === 0 && id instanceof Path) {
        return acc.concat(id.origin);
      } else {
        return acc.concat([id]);
      }
    }, []);
    super(origin);
  }

  static parse(str) {
    const s = v(str);
    const keys = s.keyString().split(".");
    return keys.length > 1 ? path(...keys) : path(s);
  }

  get receiver() {
    const [receiver,] = this.origin;
    return receiver;
  }

  get keys() {
    const [, ...keys] = this.origin;
    return keys;
  }

  isUUID(val) {
    return val instanceof Prim && typeof(val.origin) == "string" && val.origin.match(/^urn:uuid:/);
  }

  isMultiple() {
    return this.keys.length > 0;
  }

  isPartial() {
    return this.isMultiple() && this.keys.every(i => i instanceof Prim && !this.isUUID(i));
  }

  isInner() {
    return this.isMultiple() && this.keys.every(i => this.isUUID(i));
  }

  stringify(indent=0) {
    return "Path " + Val.stringify(this.origin, indent);
  }

  keyString() {
    if (this.origin.some(i => i instanceof Sym)) {
      throw "cannot contains a Sym value";
    }

    if (this.origin.some(i => typeof(i.origin) === "number" && i.origin % 1 !== 0)) {
      throw "cannot contains a float number value";
    }

    if (this.origin.some(i => Array.isArray(i))) {
      throw "cannot contains a method calling";
    }

    return this.origin.map(i => i.keyString()).join(".");
  }

  get(key, store) {
    return super.get(key, store) || store.findPropFromSterotype(this, key);
  }

  replace(matches) {
    return new this.constructor(...this.origin.map(id => Array.isArray(id) ? id.map(i => i.replace(matches)) : id.replace(matches)));
  }

  step(store) {
    let obj = store;
    for (const elm of this.origin) {
      let key;
      let args = [];
      if (Array.isArray(elm)) {
        const [top, ...rest] = elm;
        key = top;
        args = rest;
      } else {
        key = elm;
      }

      let prop = obj.get(key.reduce(store), store);
      if (prop instanceof Function) {
        // LiftedNativeの基本仕様はthisでstoreを渡すだが
        // 組み込みのメソッドの場合、thisで自身を参照したいケースが大半で
        // storeを渡すわけにいかないので、自身の値をbindする
        const f = prop.bind(obj);
        const nf = (...args) => {
          const as = args.map(a => a.reduce(store));
          if (as.some(a => a.reducible)) {
            return exp(new LiftedNative(nf), ...as);
          }

          return f(...as);
        };
        prop = func(new LiftedNative(nf));
      }

      if (prop === undefined) {
        return this;
      }

      const innerPath = path(obj, key);
      if (prop.equals(innerPath)) {
        obj = prop;
      } else if (prop instanceof Case) {
        const c = prop.replaceSelfBy(obj);
        const as = args.map(a => a.replaceSelfBy(obj));
        const e = exp(c, ...as);
        obj = e.reduce(store).replaceSelfBy(obj);
      } else {
        const replaced = prop.replaceSelfBy(obj);
        obj = replaced.reduce(store);
      }
    }

    return obj;
  }

  object(store) {
    const base = super.object(store);
    return Object.assign({}, base, {
      origin: this.origin.map(o => {
        if (Array.isArray(o)) {
          return o.map(i => i.object(store));
        } else {
          return o.object(store);
        }
      })
    });
  }

  diff(leaf) {
    const keys = this.keys.concat();
    keys.reverse();
    const lf = Object.assign({}, leaf.origin);
    return keys.reduce((a, c) => {
      return {[c.keyString()]: a};
    }, lf);
  }

  parent() {
    // todo: keysが空なら親は存在しなのでエラーにする
    const keys = this.keys.concat();
    keys.pop(); // remove child
    return new Path(this.receiver, ...keys);
  }
}

export function path(...args) {
  return new Path(...args);
}
