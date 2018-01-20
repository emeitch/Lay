import _ from 'lodash';

export default class Val {
  constructor(origin) {
    if(this.constructor === Val) {
      throw "Can not create Val instances. 'Val' is abstruct class.";
    }

    this.origin = origin;
  }

  get id() {
    return this;
  }

  equals(other) {
    return _.isEqual(this, other);
  }

  get reducible() {
    return true;
  }

  step(_book) {
    return this;
  }

  reduce(book) {
    return this.step(book);
  }

  replace(_matches) {
    return this;
  }

  replaceAsTop(matches) {
    return this.replace(matches);
  }

  collate(val) {
    return this.equals(val) ? {it: val} : null;
  }

  match(pattern) {
    return pattern.collate(this);
  }

  static stringify(v, indent=0) {
    if (v instanceof Val) {
      return v.stringify(indent);
    } else {
      if (Array.isArray(v)) {
        return "["
          + v.map(i => "\n" + " ".repeat(indent+2) + this.stringify(i, indent+2)).join(", ")
          + "\n" + " ".repeat(indent) + "]";
      } else if (v !== null & typeof(v) === "object") {
        return "{"
          + Object.keys(v).map(k => "\n" + " ".repeat(indent+2) + k + ": " + this.stringify(v[k], indent+2)).join(", ")
          + "\n" + " ".repeat(indent) + "}";
      } else {
        return JSON.stringify(v);
      }
    }
  }
}
