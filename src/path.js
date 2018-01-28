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
    let r = book.obj(this.receiver.reduce(book));
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
      const prop = r.get(k, book).id;
      if (prop.equals(v(null))) {
        return super.step(book);
      }

      const env = new Env(book);
      env.set("self", r.id);

      if (prop instanceof Case) {
        const e = exp(prop, ...args);
        r = book.obj(e.reduce(env));
      } else {
        r = book.obj(prop.reduce(env));
      }
    }
    return r.id;
  }
}

export function path(...args) {
  return new Path(...args);
}
