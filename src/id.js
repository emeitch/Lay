import Ref from './ref';

export default class ID extends Ref {
  get reducible() {
    return false;
  }

  stringify(_indent) {
    return this.prefix() + this.origin;
  }

  get(key, book) {
    if (!book) {
      return super.get(key, book);
    }
    
    const log = book.findLogWithTags(this, key);
    return log ? log.val : super.get(key, book);
  }
}
