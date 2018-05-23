import Ref from './ref';
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
        return index === 0 ? sym(id) : v(id);
      } else if (Array.isArray(id)) {
        return id.map(i => {
          if (typeof(i) === "string") {
            return index === 0 ? sym(i) : v(i);
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

  step(book) {
    let val;
    if (Array.isArray(this.receiver)) {
      val = exp(...this.receiver).reduce(book);
    } else {
      val = this.receiver.reduce(book);
    }

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

      let prop = val.get(key, book);
      if (prop instanceof Function) {
        // LiftedNativeの基本仕様はthisでbookを渡すだが
        // 組み込みのメソッドの場合、thisで自身を参照したいケースが大半で
        // bookを渡すわけにいかないので、自身の値をbindする
        const f = prop.bind(val);
        const nf = (...args) => {
          const as = args.map(a => a.reduce(book));
          if (as.some(a => a.reducible)) {
            return exp(new LiftedNative(nf), ...as);
          }

          return f(...as);
        };
        prop = func(new LiftedNative(nf));
      }
      if (prop === undefined) {
        return super.step(book);
      }

      if (prop instanceof Case) {
        const c = prop.replaceSelfBy(val);
        const as = args.map(a => a.replaceSelfBy(val));
        const e = exp(c, ...as);
        val = e.reduce(book).replaceSelfBy(val);
      } else {
        const replaced = prop.replaceSelfBy(val);
        val = replaced.reduce(book);
      }
    }

    return val;
  }
}

export function path(...args) {
  return new Path(...args);
}
