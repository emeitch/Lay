import UUID from './uuid';
import { sym } from './sym';
import { path } from './path';
import v from './v';
import Act from '../src/act';
import Comp, { CompMap } from './comp';

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
      type: path("Store")
    });
    this.set("currentStoreId", this.id);
  }

  convertStringKey(key) {
    return JSON.stringify(v(key).object());
  }

  convertObjectKey(key) {
    return v(parseVal(JSON.parse(key)));
  }

  doSet(key, val) {
    const pair = {
      key: this.convertStringKey(key),
      val: v(val)
    };
    this.objs.set(pair.key, pair.val);
    return pair;
  }

  set(key, val) {
    const pair = this.doSet(key, val);
    this.handleOnPut([pair]);
  }

  doPut(obj) {
    const o = v(obj);
    this.doSet(o.get("_id"), obj);
  }

  put(obj) {
    const o = v(obj);
    this.set(o.get("_id"), obj);
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
    const o = this.get(key);

    let d = v(diff).origin;
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
    this.set(key, newObj);
  }

  patchProp(id, key, val) {
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
      this.set(name, other.id);
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

    const prop = val.getOwnProp(key, this);
    if (prop) {
      return prop;
    }

    return undefined;
  }

  getProp(id, key) {
    return this.findPropWithType(id, key);
  }

  traversePropFromType(obj, key) {
    const tprop = obj.getOwnProp("type", this);
    const tprops = tprop.type.equals(sym("Array")) ? tprop : v([tprop]);
    for (const tref of tprops.origin) {
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
    this.set(id, v(reduced));
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
      const tprop = val.get("type", this);
      const tprops = tprop.type.equals(sym("Array")) ? tprop : v([tprop]);
      for (const tref of tprops.origin) {
        const t = tref.replaceSelfBy(key).reduce(this);
        if (t.equals(cls)) {
          results.push(key);
        }
      }
    }
    return results;
  }

  setAct(id, key, val) {
    return new Act(() => {
      this.patchProp(id, key, val.unpack());
      // const obj = Object.assign({}, this.get(id).origin);
      // const k = key.origin;
      // if (val.equals(v(null))) {
      //   delete obj[k];
      // } else {
      //   obj[k] = val.unpack();
      // }
      // this.set(id, obj);
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

function parseVal(raw) {
  const head = !raw || raw.head === undefined ? null : parseVal(raw.head);
  const type = typeof(raw);
  if (
    raw === null ||
    type === "number" ||
    type === "string" ||
    type === "boolean"
  ) {
    return raw;
  }

  if (Array.isArray(raw)) {
    return raw.map(i => parseVal(i));
  }

  if (type === "object") {
    if (!raw.type) {
      return sym(raw.origin);
    }

    const klass = parseVal(raw.type);
    if (klass.origin === "Comp") {
      return v(head, parseVal(raw.origin));
    } else if (klass.origin === "Array") {
      return v(head, raw.origin.map(i => parseVal(i)));
    } else if (klass.origin === "Map") {
      const org = {};
      for (const key of Object.keys(raw.origin)) {
        org[key] = parseVal(raw.origin[key]);
      }
      return v(head, org);
    } else if (klass.origin === "Date") {
      return v(head, new Date(raw.origin));
    } else if (klass.origin === "UUID") {
      return new UUID(raw.origin);
    } else if (klass.origin === "Path") {
      return path(...parseVal(raw.origin));
    } else {
      throw `unsupported type: ${JSON.stringify(raw)}`;
    }
  }

  throw `can not identify a val: ${JSON.stringify(raw)}`;
}

export function parseObjs(raws) {
  const objs = [];
  for (const raw of raws) {
    const obj = parseVal(raw);
    objs.push(obj);
  }
  return objs;
}
