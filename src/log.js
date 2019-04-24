export default class Log {
  constructor(key, val, rev) {
    this.key = key;
    this.val = val;
    this.rev = rev;
  }
}

export function log(...args) {
  return new Log(...args);
}
