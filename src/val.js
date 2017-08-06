export default class Val {
  constructor(origin) {
    this.origin = origin;
  }

  reduce(_env) {
    return this;
  }

  collate(val) {
    return (
      this.constructor === val.constructor
      && this.origin === val.origin
    ) ? {it: val} : undefined;
  }

  match(pattern) {
    return pattern.collate(this);
  }

  toJSON() {
    return JSON.stringify(this.origin);
  }
}

export function v(origin) {
  return new Val(origin);
}
