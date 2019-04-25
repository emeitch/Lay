export default class Log {
  constructor(key, val, rev, prev) {
    this.key = key;
    this.val = val;
    this.rev = rev;
    this.prev = prev;
  }
}

export function log(...args) {
  return new Log(...args);
}
