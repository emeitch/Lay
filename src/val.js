import _ from 'underscore';

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

  static stringify(v) {
    if (v instanceof Val) {
      return v.str();
    } else {
      if (Array.isArray(v)) {
        return "[ "
          + v.map(i => Val.stringify(i)).join(", ")
          + " ]";
      } else if (v !== null & typeof(v) === "object") {
        return "{ "
          + Object.keys(v).map(k => k + ": " + Val.stringify(v[k])).join(", ")
          + " }";
      } else {
        return JSON.stringify(v);
      }
    }
  }
}
