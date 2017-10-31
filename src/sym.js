import Val from './val';

export default class Sym extends Val {
  collate(val) {
    return {
      it: val,
      [this.origin]: val
    };
  }

  replace(book, sym, val) {
    return this.equals(sym) ? val : this;
  }

  step(book) {
    return book.resolve(this.origin);
  }
}

export function sym(origin) {
  return new Sym(origin);
}
