import Ref from './ref';

export default class ID extends Ref {
  get reducible() {
    return false;
  }

  stringify(_indent) {
    return this.prefix() + this.origin;
  }

  getOwnProp(key, book) {
    return book && book.getOwnProp(this, key) || super.getOwnProp(key, book);
  }

  get(key, book) {
    return book && book.getProp(this, key) || super.get(key, book);
  }
}
