import UUID from './uuid';
import v from './v';
import Ref from './ref';
import Sym, { sym } from './sym';
import Act from './act';
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
      _type: sym("Store")
    });
    this.assign("currentStoreId", this.id);
  }

  objToStr(key) {
    return v(key).stringify();
  }

  strToObj(kstr) {
    const m = kstr.match(/^urn:uuid:(.*)/);
    if (m && m[1]) {
      return new UUID(m[1]);
    }

    return sym(kstr);
  }

  doPut(obj, block) {
    const tprop = obj.getOwnProp("_type");
    if (!(tprop instanceof Sym)) {
      throw `bad type reference style: ${tprop.stringify()}`;
    }

    const rid = new UUID();
    const at = v(new Date());
    const rev = v({
      _id: rid,
      _rev: rid,
      _type: sym("Revision"),
      at
    });
    const ridstr = this.objToStr(rid);
    this.objs.set(ridstr, rev);

    const prid = obj.getOwnProp("_rev");
    const prev = {};
    if (prid) {
      prev._prev = prid;
    }

    const kstr = this.objToStr(obj.getOwnProp("_id"));
    const origin = Object.assign({}, obj.origin, prev, {_rev: rid});
    const o = v(origin);
    this.objs.set(kstr, o);

    if (block) {
      block([rev, o]);
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
    this.doPut(o, objs => {
      this.handleOnPut(objs);
    });
  }

  handleOnPut(objs) {
    this.iterateImports(store => {
      const actexp = store.fetch("onPut");
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

    const obj = this.fetch(key);
    this.assign(key, obj ? obj.patch(d) : d);
  }

  set(id, key, val) {
    const k = v(key);
    this.patch(id, {
      [k.origin]: val
    });
  }

  fetchWithoutImports(key) {
    const kstr = this.objToStr(key);
    return this.objs.get(kstr);
  }

  handleOnInport(other) {
    const actexp = other.fetch("onImport");
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

  fetch(key) {
    if (typeof(key) === "string") {
      key = sym(key);
    }

    return this.fetchWithoutImports(key) || this.fetchWithImports(store => store.fetchWithoutImports(key));
  }

  resolve(ref) {
    let obj = ref;
    while(obj instanceof Ref || obj instanceof Sym) {
      obj = this.fetch(obj);
      obj = obj && obj.reduce(this); // for _target reducing
    }

    return obj ? obj : ref;
  }

  traversePropFromType(obj, key) {
    const tref = obj.getOwnProp("_type");
    const tobj = this.resolve(tref);
    const p = tobj && tobj.getOwnProp(key);
    if (p) {
      return p;
    }

    // Mapクラスの実態がCompMapのため、ifで無限再帰を抑制
    if (tobj && !obj.equals(tobj)) {
      const p = this.traversePropFromType(tobj, key);
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

    const ot = this.fetch("Object");
    const op = ot && ot.getOwnProp(key);
    if (op) {
      return op;
    }

    return undefined;
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
    for (const [kstr, val] of this.objs) {
      const status = val.get("_status", this);
      if (status.reduce(this).equals(v("deleted", null))) {
        continue;
      }

      const key = this.strToObj(kstr);
      const tref = val.get("_type", this);
      const tobj = this.resolve(tref);
      if (tobj && tobj.equals(cls)) {
        results.push(key);
      }
    }

    return results;
  }

  setAct(obj, key, val) {
    const id = obj instanceof CompMap ? obj.getOwnProp("_id") : obj;
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
