import ID from './id';
import UUID from './uuid';

export default class LID extends ID {
  /* istanbul ignore next */
  constructor(origin = UUID.generateString()) {
    super();
    this.origin = origin;
  }

  toString() {
    return "_:" + this.origin;
  }

  toJSON() {
    return this.toString();
  }
}