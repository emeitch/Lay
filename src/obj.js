import Path from './path';
import Comp from './comp';

export default class Obj {
  constructor(book, id) {
    this.book = book;
    this.id = id;
  }

  get origin() {
    return this.id.origin;
  }

  get(key) {
    if (this.id instanceof Comp) {
      const comp = this.id;
      const prop = comp.get(key, this.book);
      return this.book.obj(prop);
    }

    const path = new Path(this.id, key);
    const v = path.reduce(this.book);
    if (v === path){
      return null;
    } else {
      return this.book.obj(v);
    }
  }

  call(key, ...args) {
    const path = new Path(this.id, [key, ...args]);
    const v = path.reduce(this.book);
    return v; // todo: #getと同じくUUID時にObjで返さなくて良い?
  }
}
