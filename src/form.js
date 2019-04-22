export default class Form {
  constructor(key, val) {
    this.key = key;
    this.val = val;
  }
}

export function form(...args) {
  return new Form(...args);
}
