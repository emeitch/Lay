export default class ID {
  constructor(origin) {
    this.origin = origin;
  }

  toString() {
    return this.prefix() + this.origin;
  }

  toJSON() {
    return this.toString();
  }
}
