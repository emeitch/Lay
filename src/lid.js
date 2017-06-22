import UUID from './uuid';

export default class LID {
  constructor(origin = UUID.generateString()) {
    this.origin = origin;
  }

  toString() {
    return "_:" + this.origin;
  }

  toJSON() {
    return this.toString();
  }
}