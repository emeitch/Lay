import _ from 'underscore';

let hashConstructor=undefined;

export default class Val {
  constructor(origin) {
    this.origin = origin;
  }

  static setHash(hash) {
    hashConstructor = hash;
  }

  get hash() {
    return new hashConstructor(this.origin);
  }

  get id() {
    return this.hash;
  }

  get(key) {
    return v(this.origin[key]);
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

export class Prim extends Val {
  get id() {
    return this;
  }

  get reducible() {
    return false;
  }
}

export class Comp extends Val {
  get reducible() {
    return false;
  }
}

export function v(origin) {
  const type = typeof(origin);

  if (type === "number" ||
      type === "string" ||
      type === "boolean") {
    return new Prim(origin);
  }

  if (Array.isArray(origin) ||
      (type === "object" &&
       (origin.constructor === Object ||
        origin.constructor === Date))) { // todo:DateはJSではなくLay側の型・クラスに変更したい
    return new Comp(origin);
  }

  throw `not supported origin: ${origin}`;
}
