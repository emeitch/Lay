import Val from './val';
import Box from './box';

export default class Exp extends Val {
  constructor(...terms) {
    super(terms);
  }

  get terms() {
    return this.origin;
  }

  reduce(env=new Box()) {
    const [func, ...rest] = this.terms;
    const args = rest.map(a => a.reduce(env));
    if (args.every(arg => arg.constructor === Val)) {
      return func.apply(...args);
    } else {
      return super.reduce(env);
    }
  }
}
