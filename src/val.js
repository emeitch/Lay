import _ from 'lodash';

export default class Val {
  constructor(origin) {
    if(this.constructor === Val) {
      throw "Can not create Val instances. 'Val' is abstruct class.";
    }

    this.origin = origin;
  }

  get protoName() {
    return this.constructor.name;
  }

  get __proto() {
    return new Prim(this.protoName);
  }

  get jsObj() {
    return this.origin;
  }

  getJSProp(key) {
    const val = this["_"+key];
    if (val) {
      return val;
    }

    return undefined;
  }

  convertKeyString(key) {
    return key instanceof Val ? key.keyString() : key;
  }

  getOwnProp(key) {
    const kstr = this.convertKeyString(key);
    return this.getJSProp(kstr);
  }

  get(key, store) {
    const kstr = this.convertKeyString(key);

    if (store) {
      const prop = store.findPropFromProto(this, kstr);
      if (prop) {
        return prop;
      }
    }

    return this.getJSProp(kstr);
  }

  equals(other) {
    return _.isEqual(this, other);
  }

  get _equals() {
    return function(o) {
      return new Prim(this.equals(o));
    };
  }

  isClass() {
    const id = this.getOwnProp("_id");
    return typeof(id.origin) === "string" && id.origin.match(/^[A-Z]/) && !id.origin.match(/\./);
  }

  step(_store) {
    return this;
  }

  reduce(store) {
    let prev = this;
    let e = this.step(store);
    while(!e.equals(prev)) {
      prev = e;
      e = e.step(store);
    }
    return e;
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

  get isPacked() {
    return false;
  }

  unpack() {
    return this;
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

  object(store) {
    return {
      _proto: this.__proto.object(store),
      origin: this.origin
    };
  }

  isUUID() {
    return false;
  }

  keyString() {
    return this.stringify();
  }

  keyVal() {
    return new Prim(this.keyString());
  }

  get _toStr() {
    return this.keyVal();
  }

  _onPutByProto(_id) {
    return this;
  }
}

/*********************************************************************/
export class Sym extends Val {
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

  stringify(_indent) {
    return this.origin;
  }

  object(_store) {
    return {
      origin: this.origin
    };
  }
}

/*********************************************************************/
export class Prim extends Val {
  stringify(_indent) {
    return JSON.stringify(this.origin);
  }

  get protoName() {
    if (this.origin === null) {
      return "Null";
    }

    const jstype = typeof(this.origin);
    return jstype[0].toUpperCase() + jstype.substring(1);
  }

  isUUID() {
    return typeof(this.origin) === "string" && !!this.origin.match(/^urn:uuid:/);
  }

  object(_store) {
    return this.origin;
  }

  keyString() {
    return this.origin === null ? "null" : this.origin.toString();
  }
}
