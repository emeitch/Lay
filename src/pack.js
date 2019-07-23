import Val from './val';

export default class Pack extends Val {
  get isPacked() {
    return true;
  }

  unpack() {
    return this.origin;
  }
}

export function pack(...args) {
  return new Pack(...args);
}
