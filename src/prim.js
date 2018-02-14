import Val from './val';
import { sym } from './sym';

export default class Prim extends Val {
  get reducible() {
    return false;
  }

  stringify(_indent) {
    return JSON.stringify(this.origin);
  }

  get tag() {
    const type = typeof(this.origin);
    return sym(type[0].toUpperCase() + type.substring(1));
  }
}
