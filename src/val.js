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

  get tag() {
    return new Sym(this.constructor.name);
  }

  get(key, book) {
    const val = this[key];
    if (val) {
      return val;
    }

    if (!book) {
      throw `not exists key: ${key}`;
    }

    const proto = this.tag.reduce(book);
    return proto.get(key, book);
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
    return this.equals(val) ? {__it__: val} : null;
  }

  match(pattern) {
    return pattern.collate(this);
  }

  appendIndent(str, indent=0) {
    return str.toString().replace(/\n/g, "\n"+" ".repeat(indent));
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

export class Sym extends Val {
  get reducible() {
    return false;
  }

  collate(val) {
    return {
      [this.origin]: val
    };
  }

  replace(matches) {
    const mresults = matches.filter(m => m.result).map(m => m.result);
    for (const result of mresults) {
      for (const key of Object.keys(result)) {
        if (this.equals(new Sym(key))) {
          return result[key];
        }
      }
    }
    return this;
  }

  step(book) {
    const val = book.get(this.origin);
    return val !== undefined ? val : this;
  }

  stringify(_indent) {
    return this.origin;
  }
}
