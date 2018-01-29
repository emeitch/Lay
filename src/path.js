import Ref from './ref';
import { Env } from './book';
import Val from './val';
import Case from './case';
import { exp } from './exp';
import v from './v';

export default class Path extends Ref {
  constructor(...ids) {
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

      const k = key.reduce(book);
      const prop = book.obj(val).get(k);
      if (prop.equals(v(null))) {
        return super.step(book);
      }

      const env = new Env(book);
      env.set("self", val);

      if (prop instanceof Case) {
        const e = exp(prop, ...args);
        val = e.reduce(env);
      } else {
        val = prop.reduce(env);
      }
    }
    return val;
  }
}

export function path(...args) {
  return new Path(...args);
}
