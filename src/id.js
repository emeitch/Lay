import Ref from './ref';

export default class ID extends Ref {
  toString() {
    return this.prefix() + this.origin;
  }

  toJSON() {
    return this.toString();
  }
}
