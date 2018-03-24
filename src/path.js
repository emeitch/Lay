import Ref from './ref';
import { Env } from './book';
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
        prop = func(new LiftedNative(prop));
      }
      if (prop.equals(v(null))) {
        prop = val.get(key, book);
        if (prop.equals(v(null))) {
          return super.step(book);
        }
      }

      const env = new Env();
      env.set("self", val);
      env.import(book); // todo: Env生成時にbookを指定するとselfのsetでonPutが走るので応急的にset後のimportで対応

      if (prop instanceof Case) {
        const e = exp(prop, ...args);
        val = e.reduce(env);
      } else {
        const replaced = prop.replace([{result: {self: val}}]);
        val = replaced.reduce(book);
      }
    }
    return val;
  }
}

export function path(...args) {
  return new Path(...args);
}
