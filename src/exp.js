import Val from './val';
import Book from './book';

export default class Exp extends Val {
  constructor(...terms) {
    super(terms);
  }

  get terms() {
    return this.origin;
  }

  reduce(book=new Book()) {
    const [func, ...rest] = this.terms;
    const args = rest.map(a => a.reduce(book));
    if (args.every(arg => arg.constructor === Val)) {
      if (func instanceof Function) {
        const oargs = args.map(a => a.origin);
        const orig = func.apply(undefined, oargs);
        return new Val(orig);
      } else {
        return func.apply(...args);
      }
    } else {
      return super.reduce(book);
    }
  }
}
