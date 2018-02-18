import Ref from './ref';
import { Env } from './book';
import Val from './val';
import Case from './case';
import { exp } from './exp';
import { sym } from './sym';
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

      const k = key.reduce(book);
      const prop = val.get(k, book);
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
