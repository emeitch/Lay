import Ref, { ref } from './ref';
import Val from './val';
import Case from './case';
import v from './v';
import { sym } from './sym';
import { exp } from './exp';
import { func, LiftedNative } from './func';

export default class Path extends Ref {
  constructor(...ids) {
    ids = ids.map((id, index) => {
      if (typeof(id) === "string") {
        return index === 0 ? ref(id) : v(id);
      } else if (Array.isArray(id)) {
        return id.map((i, idx) => {
          if (typeof(i) === "string") {
            return index === 0 && idx === 0 ? sym(i) : v(i);
          } else {
            return i;
          }
        });
      } else {
        return id;
      }
    });
    super(ids);
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

  replace(matches) {
    return new this.constructor(...this.origin.map(id => Array.isArray(id) ? id.map(i => i.replace(matches)) : id.replace(matches)));
  }

  step(store) {
    let obj;
    if (Array.isArray(this.receiver)) {
      obj = exp(...this.receiver).reduce(store);
    } else {
      obj = this.receiver.reduce(store);
    }
    obj = store.resolve(obj);

    for (const elm of this.keys) {
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

      if (!key.equals(v("_id"))) {
        // _idの場合だけ特別にIDそのものを返す特別処理
        obj = store.resolve(obj);
      }
    }

    return obj;
  }

  object(_store) {
    return {
      _type: this._type.object(_store),
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
      return {[c.origin]: a};
    }, lf);
  }

  keyString() {
    return this.stringify();
  }
}

export function path(...args) {
  return new Path(...args);
}
