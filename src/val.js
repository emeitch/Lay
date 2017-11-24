import _ from 'underscore';

export default class Val {
  constructor(origin) {
    this.origin = origin;
  }

  equals(other) {
    return _.isEqual(this, other);
  }

  get reducible() {
    return true;
  }

  replace(_matches) {
    return this;
  }

  replaceAsTop(matches) {
    return this.replace(matches);
  }

  step(_book) {
    return this;
  }

  reduce(book) {
    return this.step(book);
  }

  collate(val) {
    return this.equals(val) ? {it: val} : undefined;
  }

  match(pattern) {
    return pattern.collate(this);
  }

  toJSON() {
    return JSON.stringify(this.origin);
  }
}
