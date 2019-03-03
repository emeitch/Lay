import Val from './val';

export default class Pack extends Val {
  unpack() {
    return this.origin;
  }
}

export function pack(...args) {
  return new Pack(...args);
}
