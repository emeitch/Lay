import Ref from './ref';

export default class ID extends Ref {
  get reducible() {
    return false;
  }

  stringify(_indent) {
    return this.prefix() + this.origin;
  }

  get(key, book) {
    if (book) {
      const rel = book.findRelWithType(this, key);
      if (rel) {
        return book.getEdgeHead(rel, "object");
      }
    }

    return super.get(key, book);
  }
}
