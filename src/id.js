import Val from './val';

export default class ID extends Val {
  toString() {
    return this.prefix() + this.origin;
  }

  toJSON() {
    return this.toString();
  }
}
