import Val from './val';

export default class Sym extends Val {
  reduce(book) {
    return book.resolve(this.origin);
  }

  collate(val) {
    return {
      it: val,
      [this.origin]: val
    };
  }
}
