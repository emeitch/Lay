export default class Form {
  constructor(key, val, rev) {
    this.key = key;
    this.val = val;
    this.rev = rev;
  }
}

export function form(...args) {
  return new Form(...args);
}
