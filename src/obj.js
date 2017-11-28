import UUID from './uuid';
import Path from './path';

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
    const path = new Path(this.id, [key, ...args]);
    const v = path.reduce(this.book);
    return v; // todo: #getと同じくUUID時にObjで返さなくて良い?
  }
}
