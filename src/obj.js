import UUID from './uuid';
import Path from './path';
import Book from './book';

export default class Obj {
  constructor(book, id) {
    this.book = book;
    this.id = id;
  }

  get(key) {
    const path = new Path(this.id, key);
    const v = path.reduce(this.book);
    if (v instanceof UUID) {
      return new Obj(this.book, v);
    } else if (v === path){
      return undefined;
    } else {
      return v;
    }
  }

  call(key, ...args) {
    const f = this.get(key);
    const e = new Book(this.book);
    e.assign("self", this.id);
    return f.apply(e, ...args).reduce(e);
  }
}
