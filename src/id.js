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
      const log = book.findLogWithType(this, key);
      if (log) {
        return log.val;
      }
    }

    return super.get(key, book);
  }
}
