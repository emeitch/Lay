export default class Form {
  constructor(key) {
    this.key = key;
  }
}

export function form(...args) {
  return new Form(...args);
}
