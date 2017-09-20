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
    const [op, ...rest] = this.terms;
    const args = rest.map(a => a.reduce(book));
    if (args.every(arg => arg.constructor === Val)) {
      if (op instanceof Function) {
        const oargs = args.map(a => a.origin);
        const orig = op.apply(undefined, oargs);
        return new Val(orig);
      } else {
        return op.reduce(book).apply(book, ...args);
      }
    } else {
      return super.reduce(book);
    }
  }
}
