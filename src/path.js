import Ref from './ref';
import ID from './id';
import { self } from './self';
import Ctx from './ctx';

export default class Path extends Ref {
  constructor(...ids) {
    const [receiver, ...keys] = ids;
    if (!(receiver instanceof ID) && receiver !== self) {
      throw `${receiver} is not a ID or a Self`;
    }
    for (const id of keys) {
      if (!(id instanceof ID)) {
        throw `${id} is not a ID`;
      }
    }
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

  reduce(ctx) {
    let v = this.receiver.reduce(ctx);
    for (const key of this.keys) {
      const k = key.reduce(ctx);
      const note = ctx.box.activeNote(v, k);
      if (!note) {
        return super.reduce(ctx);
      }
      v = note.val.reduce(new Ctx(ctx, note.id));
    }
    return v;
  }
}
