import Env from './env';
import UUID from './uuid';
import Path from './path';

export default class Obj extends Env {
  get(key) {
    const path = new Path(this.id, key);
    const v = path.reduce(this);
    if (v instanceof UUID) {
      return new Obj(this.store, v);
    } else if (v === path){
      return undefined;
    } else {
      return v;
    }
  }
}
