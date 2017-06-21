import UUID from 'uuid';

export default class LID extends UUID {
  toString() {
    return "_:" + this.origin;
  }

  toJSON() {
    return this.toString();
  }
}