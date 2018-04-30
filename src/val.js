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

  get class() {
    return new Sym(this.constructor.name);
  }

  get _class() {
    return this.class;
  }

  get _toStr() {
    return new Prim(this.stringify());
  }

  get jsObj() {
    return this.origin;
  }

  get(k, book) {
    const key = k instanceof Prim ? k.origin : k;

    if (book) {
      const proto = this.class.reduce(book);
      if (!(proto instanceof Sym)) {
        return proto.get(key, book);
      }
    }

    const val = this["_"+key];
    if (val) {
      return val;
    }

    return undefined;
  }

  equals(other) {
    return _.isEqual(this, other);
  }

  get _equals() {
    return function(o) {
      return new Prim(this.equals(o));
    };
  }

  get reducible() {
    return true;
  }

  step(_book) {
    return this;
  }

  reduce(book) {
    let prev = this;
    let e = this.step(book);
    while(!e.equals(prev)) {
      prev = e;
      e = e.step(book);
    }
    return e;
  }

  deepReduce(book) {
    let r = this.reduce(book);
    if (!r.equals(this)) {
      r = r.deepReduce(book);
    }
    return r;
  }

  replace(_matches) {
    return this;
  }

  replaceAsTop(matches) {
    return this.replace(matches);
  }

  replaceSelfBy(val) {
    return this.replace([val.match(new Sym("self"))]);
  }

  collate(target) {
    const result = this.equals(target) ? { __it__: target } : null;
    return { pattern: this, target, result };
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

  stringify(_indent=0) {
    return Val.stringify(this.origin, _indent);
  }

  object(_book) {
    return {
      class: this.class.object(_book),
      origin: this.origin
    };
  }
}

/*********************************************************************/
export class Sym extends Val {
  get reducible() {
    return false;
  }

  collate(target) {
    return {
      pattern: this,
      target,
      result: {
        [this.origin]: target
      }
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

  object(_book) {
    return this.origin;
  }
}

/*********************************************************************/
export class Prim extends Val {
  get reducible() {
    return false;
  }

  stringify(_indent) {
    return JSON.stringify(this.origin);
  }

  get class() {
    if (this.origin === null) {
      return new Sym("Null");
    }

    const type = typeof(this.origin);
    return new Sym(type[0].toUpperCase() + type.substring(1));
  }
}
