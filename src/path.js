import Ref from './ref';
import Val from './val';
import Case from './case';
import { exp } from './exp';
import { sym } from './sym';
import { func, LiftedNative } from './func';
import v from './v';

export default class Path extends Ref {
  constructor(...ids) {
    ids = ids.map(id => {
      if (typeof(id) === "string") {
        return sym(id);
      } else if (Array.isArray(id)) {
        return id.map(i => {
          if (typeof(i) === "string") {
            return sym(i);
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
    let val = this.receiver.reduce(book);
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

      let prop = val.get(key.reduce(book), book);
      if (prop instanceof Function) {
        const f = prop.bind(val);
        prop = func(new LiftedNative(f));
      }
      if (prop.equals(v(null))) {
        prop = val.get(key, book);
        if (prop.equals(v(null))) {
          return super.step(book);
        }
      }

      const pattern = sym("self");
      const target = val;
      const result = {self: val};
      const match = {pattern, target, result};
      const matches = [match];

      if (prop instanceof Case) {
        const c = prop.replace(matches);
        const as = args.map(a => a.replace(matches));
        const e = exp(c, ...as);
        val = e.reduce(book).replace(matches);
      } else {
        const replaced = prop.replace(matches);
        val = replaced.reduce(book);
      }
    }
    return val;
  }
}

export function path(...args) {
  return new Path(...args);
}
