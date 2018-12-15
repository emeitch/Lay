import Val from './val';
import { sym } from './sym';

export default class Exp extends Val {
  constructor(...terms) {
    super(terms.map(t => typeof(t) === "string" ? sym(t) : t));
    this.head = sym(this.constructor.name);
  }

  get terms() {
    return this.origin;
  }

  replace(matches) {
    const terms = this.terms.map(t => t.replace(matches));
    return new this.constructor(...terms);
  }

  step(store) {
    const [op, ...args] = this.terms;
    const f = op.step(store);
    if (f != op || !f.apply) {
      return new this.constructor(f, ...args);
    }

    return f.apply(store, ...args);
  }
}

export function exp(...args) {
  return new Exp(...args);
}
