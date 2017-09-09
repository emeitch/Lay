import Val from './val';
import World from './world';

export default class Exp extends Val {
  constructor(...terms) {
    super(terms);
  }

  get terms() {
    return this.origin;
  }

  reduce(env=new World()) {
    const [func, ...rest] = this.terms;
    const args = rest.map(a => a.reduce(env));
    if (args.every(arg => arg.constructor === Val)) {
      if (func instanceof Function) {
        const oargs = args.map(a => a.origin);
        const orig = func.apply(undefined, oargs);
        return new Val(orig);
      } else {
        return func.apply(...args);
      }
    } else {
      return super.reduce(env);
    }
  }
}
