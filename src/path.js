import Val from './val';
import Case from './case';
import v from './v';
import Sym, { sym } from './sym';
import { exp } from './exp';
import { func, LiftedNative } from './func';
import { parseRef } from './parser';

export default class Path extends Val {
  constructor(...ids) {
    const origin = ids.reduce((acc, id, index) => {
      if (typeof(id) === "string") {
        return acc.concat([v(id)]);
      } else if (index === 0 && id instanceof Path) {
        return acc.concat(id.origin);
      } else if (Array.isArray(id)) {
        const applying = id.map((i, idx) => {
          if (typeof(i) === "string") {
            return index === 0 && idx === 0 ? sym(i) : v(i);
          } else {
            return i;
          }
        });
        const val = index == 0 ? exp(...applying) : applying;
        return acc.concat([val]);
      } else {
        // todo: 本来getOwnProp確認は不要なはずだがStoreがやってくる可能性があるので確認
        if (id.getOwnProp) {
          const oid = id.getOwnProp("_id");
          if (oid) {
            // todo: 本来はkeyStringは不要なはずだが
            const oids = parseRef(oid.keyString());
            return acc.concat([oids]);
          }
        }
        return acc.concat([id]);
      }
    }, []);
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

      const contextPath = path(obj, key);
      if (prop.equals(contextPath)) {
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
