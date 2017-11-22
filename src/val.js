import _ from 'underscore';

let hashConstructor=undefined;

export default class Val {
  constructor(origin) {
    this.origin = origin;
  }

  static setHash(hash) {
    hashConstructor = hash;
  }

  get id() {
    return new hashConstructor(this.origin);
  }

  equals(other) {
    return _.isEqual(this, other);
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

  get(key) {
    return v(this.origin[key]);
  }
}

export function v(origin) {
  return new Val(origin);
}
