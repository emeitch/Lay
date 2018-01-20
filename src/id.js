import Ref from './ref';

export default class ID extends Ref {
  get reducible() {
    return false;
  }

  toString() {
    return this.prefix() + this.origin;
  }
}
