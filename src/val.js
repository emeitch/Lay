import _ from 'underscore';

export default class Val {
  constructor(origin) {
    this.origin = origin;
  }

  equals(other) {
    return _.isEqual(this, other);
  }

  replace(_book, _matches) {
    return this;
  }

  step(_book) {
    return this;
  }

  reduce(book) {
    return this.step(book);
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
