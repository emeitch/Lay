import UUID from './uuid';
import v from './v';
import Sym, { sym } from './sym';
import Act from './act';
import Comp, { CompMap } from './comp';
import { parseVal } from './parser';

export default class Store {
  constructor(...imports) {
    this.objs = new Map();

    this.imports = [];
    for (const i of imports) {
      this.import(i);
    }

    this.id = new UUID();
    this.put({
      _id: this.id,
      _type: sym("Store")
    });
    this.assign("currentStoreId", this.id);
  }

  convertStringKey(key) {
    return JSON.stringify(v(key).object());
  }

  convertObjectKey(key) {
    return v(parseVal(JSON.parse(key)));
  }

  doPut(obj, block) {
    const tprop = obj.getOwnProp("_type", this);
    if (!(tprop instanceof Sym)) {
      throw `bad type reference style: ${tprop.stringify()}`;
    }

    const key = this.convertStringKey(obj.getOwnProp("_id"));
    this.objs.set(key, obj);

    if (block) {
      block(obj);
    }
  }

  assign(key, val) {
    let obj = v(val);
    if (obj instanceof CompMap) {
      obj = v(Object.assign({}, {_id: key}, obj.origin));
    } else {
      obj = v({
        _id: key,
        _target: obj
      });
    }

    this.put(obj);
  }

  merge(diff) {
    for (const key of Object.keys(diff)) {
      const val = diff[key];

      let k = key;
      const m = key.match(/^urn:uuid:(.*)/);
      if (m && m[1]) {
        k = new UUID(m[1]);
      }
      this.patch(k, val);
    }
  }

  putWithoutHandler(obj) {
    const o = v(obj);
    this.doPut(o);
  }

  put(obj) {
    const o = v(obj);
    this.doPut(o, obj => {
      this.handleOnPut([obj]);
    });
  }

  handleOnPut(objs) {
    this.iterateImports(store => {
      const actexp = store.get("onPut");
      if (actexp) {
        const act = actexp.reduce(this);
        this.run(act, objs);
      }
    });
  }

  patch(key, diff) {
    let d = v(diff).origin;
    if (typeof(d) !== "object") {
      this.assign(key, diff);
      return;
    }

    const o = this.get(key);

    let oo = {};
    if (o && o instanceof CompMap) {
      oo = Object.assign({}, o.origin);
      for (const k of Object.keys(d)) {
        if (d[k] === null || (d[k].equals && d[k].equals(v(null)))) {
          delete oo[k];
          delete d[k];
        }
      }
    }
    const newObj = Object.assign({}, oo, d);
    this.assign(key, newObj);
  }

  set(id, key, val) {
    const k = v(key);
    this.patch(id, {
      [k.origin]: val
    });
  }

  getWithoutImports(key) {
    const k = this.convertStringKey(key);
    return this.objs.get(k);
  }

  handleOnInport(other) {
    const actexp = other.get("onImport");
    if (actexp) {
      const act = actexp.reduce(this);
      this.run(act);
    }
  }

  import(other, name) {
    this.imports.push(other);
    this.handleOnInport(other);

    if (typeof(name) === "string") {
      this.assign(name, other.id);
    }
  }

  iterateImports(block) {
    let stop = block(this);
    for (const imported of this.imports) {
      if (stop) {
        break;
      }
      stop = imported.iterateImports(block);
    }
    return stop;
  }

  fetchWithImports(fetcher) {
    let result = undefined;
    this.iterateImports(store => {
      result = fetcher(store);
      return result;
    });
    return result;
  }

  get(key) {
    return this.getWithoutImports(key) || this.fetchWithImports(store => store.getWithoutImports(key));
  }

  getOwnProp(id, key) {
    const val = !(id instanceof Comp) ? this.get(id) : id;
    if (!val) {
      return undefined;
    }

    return val.getOwnProp(key, this);
  }

  getProp(id, key) {
    return this.findPropWithType(id, key);
  }

  traversePropFromType(obj, key) {
    const tref = obj.getOwnProp("_type", this);
    const type = tref.reduce(this);
    const p = type.getOwnProp(key, this);
    if (p) {
      return p;
    }

    // Mapクラスの実態がCompMapのため、ifで無限再帰を抑制
    if (!obj.equals(type)) {
      const p = this.traversePropFromType(type, key);
      if (p) {
        return p;
      }
    }
  }


  findPropFromType(obj, key) {
    const p = this.traversePropFromType(obj, key);
    if (p) {
      return p;
    }

    const ot = this.get("Object");
    const op = ot && ot.getOwnProp(key, this);
    if (op) {
      return op;
    }

    return undefined;
  }

  findPropWithType(id, key) {
    const obj = !(id instanceof Comp) ? this.get(id) : id;
    if (!obj) {
      return undefined;
    }

    const prop = obj.get(key, this);
    if (prop) {
      return prop;
    }

    return this.findPropFromType(obj, key);
  }

  new(obj={}) {
    const reduced = {_id: new UUID()};
    for (const key of Object.keys(obj)) {
      reduced[key] = obj[key].reduce(this).unpack();
    }
    const id = reduced._id;
    this.assign(id, v(reduced));
    return id;
  }

  instanceIDs(cls) {
    // todo: 線形探索なのを高速化
    const results = [];
    for (const [k, val] of this.objs) {
      const exists = val.get("exists", this);
      if (exists && !exists.reduce(this).origin) {
        continue;
      }

      const key = this.convertObjectKey(k);
      const tref = val.get("_type", this);
      const t = tref.replaceSelfBy(key).reduce(this);
      if (t.equals(cls)) {
        results.push(key);
      }
    }
    return results;
  }

  setAct(id, key, val) {
    return new Act(() => {
      this.set(id, key, val.unpack());
    });
  }

  run(e, arg) {
    let acts = e.deepReduce(this);
    if (acts instanceof Act) {
      acts = v([acts]);
    }

    let act = null;
    if (acts instanceof Comp && Array.isArray(acts.origin)) {
      for (act of acts.origin) {
        if (!(act instanceof Act)) {
          throw `not Act instance: ${act}`;
        }

        do {
          act = act.proceed(arg);
        } while(act.canProceed());
      }
    }
  }
}
