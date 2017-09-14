import Ref from './ref';
import Book from './book';

export default class Path extends Ref {
  constructor(...ids) {
    super(ids);
  }

  get receiver() {
    const [receiver,] = this.origin;
    return receiver;
  }

  get keys() {
    const [, ...keys] = this.origin;
    return keys;
  }

  toString() {
    return this.origin.join("/");
  }

  reduce(env) {
    let v = this.receiver.reduce(env);
    for (const key of this.keys) {
      const k = key.reduce(env);
      const note = env.activeNote(v, k);
      if (!note) {
        return super.reduce(env);
      }
      const e = new Book(env);
      e.assign("self", note.id);
      v = note.val.reduce(e);
    }
    return v;
  }
}
