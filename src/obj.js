import Env from './env';
import UUID from './uuid';

export default class Obj extends Env {
  get(key) {
    const log = this.store.activeLog(this.id, key);
    if (!log) {
      return undefined;
    }

    const v = log.val.reduce(this);
    return v instanceof UUID ? new Obj(this.store, v) : v;
  }
}
