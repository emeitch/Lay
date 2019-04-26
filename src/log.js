export default class Log {
  constructor(key, val, rev, prev, src) {
    this.key = key;
    this.val = val;
    this.rev = rev;
    this.prev = prev;
    this.src = src;
  }
}

export function log(...args) {
  return new Log(...args);
}
