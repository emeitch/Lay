import ID from './id';

export default class UUID extends ID {
  static generateString() {
    // UUID ver 4 / RFC 4122
    var uuid = "", i, random;
    for (i = 0; i < 32; i++) {
      random = Math.random() * 16 | 0;

      if (i === 8 || i === 12 || i === 16 || i === 20) {
        uuid += "-";
      }
      uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
    }
    return uuid;
  }


  constructor() /* istanbul ignore next */ {
    super();
    this.origin = this.constructor.generateString();
  }

  toString() {
    return "urn:uuid:" + this.origin;
  }

  toJSON() {
    return this.toString();
  }
}
