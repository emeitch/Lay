import Val from './val';

export default class Exp extends Val {
  constructor(...terms) {
    super(terms);
  }

  get terms() {
    return this.origin;
  }

  reduce(env) {
    const [func, ...rest] = this.terms;
    const args = rest.map(a => {
      try {
        return a.reduce(env);
      } catch(e) {
        return a;
      }
    });
    if (args.every(arg => arg.constructor === Val)) {
      return func.apply(...args);
    }

    return super.reduce(env);
  }
}
