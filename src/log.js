export default class Log {
  constructor(rev, id, val, prev, src) {
    // required
    this.rev = rev;
    this.id = id;
    this.val = val;

    // option
    this.prev = prev;
    this.src = src;
  }
}

export function log(...args) {
  return new Log(...args);
}
