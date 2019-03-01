import Val from './val';
import Prim from './prim';
import Case from './case';
import v from './v';
import Sym, { sym } from './sym';
import { exp } from './exp';
import { ref } from './ref';
import { func, LiftedNative } from './func';

export default class Path extends Val {
  constructor(...ids) {
    const origin = ids.map((id, index) => {
      if (typeof(id) === "string") {
        return v(id);
      } else if (Array.isArray(id)) {
        const applying = id.map((i, idx) => {
          if (typeof(i) === "string") {
            return index === 0 && idx === 0 ? sym(i) : v(i);
          } else {
            return i;
          }
        });
        return index == 0 ? exp(...applying) : applying;
      } else {
        if (index > 0) {
          const oid = id.getOwnProp("_id");
          if (oid) {
            return oid;
          }
        }
        return id;
      }
    });
    super(origin);
  }

  get receiver() {
    const [receiver,] = this.origin;
    return receiver;
  }

  get keys() {
    const [, ...keys] = this.origin;
    return keys;
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

      let prop = obj.get(key, store);
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

      if (prop instanceof Case) {
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

  object(_store) {
    return {
      origin: this.origin.map(o => {
        if (Array.isArray(o)) {
          return o.map(i => i.object(_store));
        } else {
          return o.object(_store);
        }
      })
    };
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
  const first = v(args[0]);
  if (args.length === 1 &&
      first instanceof Prim &&
      typeof(first.origin) === "string") {
    return ref(first);
  }

  return new Path(...args);
}
