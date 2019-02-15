import Val from './val';

export default class Pack extends Val {
  unpack() {
    return this.origin;
  }

  keyString() {
    return this.origin.keyString();
  }
}

export function pack(...args) {
  return new Pack(...args);
}
