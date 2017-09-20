export default class Val {
  constructor(origin) {
    this.origin = origin;
  }

  equals(other) {
    return this.constructor === other.constructor && this.origin === other.origin;
  }

  reduce(_book) {
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
