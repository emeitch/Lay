import Ref from './ref';

export default class ID extends Ref {
  get reducible() {
    return false;
  }

  stringify(_indent) {
    return this.prefix() + this.origin;
  }

  get(key, book) {
    return book && book.getProp(this, key) || super.get(key, book);
  }
}
