import { uuid } from './uuid';
import v from './v';
import Val from './val';
import Act from './act';
import Prim from './prim';
import Path, { path } from './path';
import { CompArray, CompMap } from './comp';

export default class Store {
  constructor(...imports) {
    this.objs = new Map();

    this.imports = [];
    for (const i of imports) {
      this.import(i);
    }

    this.id = uuid();
    this.put({
      _id: this.id,
      _type: "Store"
    });
    this.assign("currentStore", path(this.id));
  }

  doPut(obj) {
    const id = obj.getOwnProp("_id");
    this.objs.set(id.keyString(), obj);
  }

  putWithHandler(obj, block) {
    // todo: ロックが実現の為に下記の一連の処理がアトミックな操作となるよううまく保証する

    const tprop = obj.getOwnProp("_type");
    if (tprop.constructor !== Prim || typeof(tprop.origin) !== "string") {
      throw `bad type reference style: ${tprop.stringify()}`;
    }

    let id = obj.getOwnProp("_id");
    const pth = Path.parse(id);
    if (pth.isPartial()) {
      id = pth.receiver;
      const base = this.fetch(id) || v({_id: id});
      const diff = pth.diff(obj);
      obj = base.patch(diff);
    } else if (pth.isMultiple() && !pth.isInner()) {
      throw "intermediate object are not inner object";
    } else if (pth.isMultiple() && !this.fetch(pth.parent().keyVal())) {
      throw "intermediate object not found";
    }

    const old = this.fetch(id);
    const orid = old && old.getOwnProp("_rev");
    const prid = obj.getOwnProp("_rev");
    if (orid && !prid) {
      throw "optimistic locked: _rev is not specified";
    }
    if (orid && !orid.equals(prid)) {
      throw "optimistic locked: specified _rev is not latest";
    }

    const rid = uuid();
    const rev = v({
      _id: rid,
      _rev: rid,
      _type: "Revision",
      at: v(new Date())
    });

    const meta = {
      _id: id.keyString(),
      _rev: rid
    };
    if (prid) {
      meta._prev = prid;
    }
    const o = obj.patch(meta);

    this.doPut(rev);
    this.doPut(o);

    block([rev, o]);
  }

  assign(key, val) {
    let obj = v(val);

    const old = this.fetch(key);
    const orev = old && old.getOwnProp("_rev");
    const rev = {};
    if (orev) {
      rev._rev = orev;
    }

    if (obj instanceof CompMap) {
      const origin = Object.assign(
        {},
        {
          _id: key
        },
        obj.origin,
        rev
      );
      obj = v(origin);
    } else {
      const origin = Object.assign(
        {},
        {
          _id: key,
          _body: obj
        },
        rev
      );
      obj = v(origin);
    }

    this.put(obj);
  }

  merge(diff) {
    for (const key of Object.keys(diff)) {
      const val = diff[key];
      this.patch(key, val);
    }
  }

  putWithoutHandler(obj) {
    const o = v(obj);
    this.doPut(o);
  }

  put(obj) {
    const o = v(obj);
    this.putWithHandler(o, objs => {
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
      [k.keyString()]: val
    });
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
      this.assign(name, path(other.id));
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

  fetchObjWithImports(fetcher) {
    let result = undefined;
    this.iterateImports(store => {
      result = fetcher(store);
      return result;
    });
    return result;
  }

  fetchObjWithoutImports(key) {
    const k = key.keyString();
    return this.objs.get(k);
  }

  fetchObj(key) {
    if (typeof(key) === "string") {
      key = v(key);
    }

    return this.fetchObjWithoutImports(key) || this.fetchObjWithImports(store => store.fetchObjWithoutImports(key));
  }

  fetch(key) {
    const obj = this.fetchObj(key);
    const body = obj && obj.getOwnProp("_body");
    return body || obj;
  }

  getOwnProp(key) {
    return this.fetch(this.id).getOwnProp(key);
  }

  get(key) {
    if (key instanceof Prim && typeof(key.origin) === "string") {
      const obj = this.fetch(key);
      if (obj) {
        const val = obj.getOwnProp("_val");
        if (val) {
          return val;
        } else {
          return obj;
        }
      }
    }

    // regard the key as a result object if it can't fetch by the key
    return key;
  }

  match() {
    return false;
  }

  traversePropFromType(obj, key) {
    const tname = obj.getOwnProp("_type");
    const tobj = this.fetch(tname);
    if (!tobj || !(tobj instanceof CompMap)) {
      return undefined;
    }

    const p = tobj.getCompProp(key);
    if (p) {
      return p;
    }

    // Mapクラスの実態がCompMapのため、ifで無限再帰を抑制
    if (!obj.equals(tobj)) {
      const p = this.traversePropFromType(tobj, key);
      if (p) {
        return p;
      }
    }
  }

  findPropFromStereotype(pth, key) {
    const parent = this.fetch(pth.origin[0]);
    const stname = parent.get("_stereotype", this);
    const stype = stname && this.fetch(stname);
    return (stype && stype.get(key, this)) || undefined;
  }

  findPropFromType(obj, key) {
    const p = this.traversePropFromType(obj, key);
    if (p) {
      return p;
    }

    const id = obj.getOwnProp("_id");
    if (id) {
      const pth = Path.parse(id);
      if (pth.isInner()) {
        const p = this.findPropFromStereotype(pth, key);
        if (p) {
          return p;
        }
      }
    }

    const ot = this.fetch("Object");
    const op = ot && ot.getCompProp(key);
    if (op) {
      return op;
    }

    return undefined;
  }

  create(obj={}) {
    const reduced = {_id: uuid()};
    for (const key of Object.keys(obj)) {
      let prop = obj[key];
      if (prop instanceof Val) {
        prop = prop.reduce(this).unpack();
      }
      reduced[key] = prop;
    }

    const id = reduced._id;
    if (id && this.fetch(id)) {
      throw `the object already exists. id: ${id}`;
    }

    this.assign(id, v(reduced));
    return id;
  }

  update(id, diff) {
    const obj = this.fetch(id);
    if (!obj) {
      throw `the object dose not exist. id: ${id}`;
    }

    const key = obj.getOwnProp("_id");
    this.patch(key, diff);
  }

  delete(id) {
    this.update(id, {
      _status: v("deleted")
    });
  }

  deleteAct(id) {
    return new Act(() => {
      this.delete(id);
    });
  }

  get metaKeys() {
    return ["_id", "_rev", "_prev"];
  }

  copy(obj) {
    if (obj instanceof Prim) {
      const id = obj;
      obj = this.fetch(id);
    }

    const copied = Object.assign({}, obj.object(this));
    this.metaKeys.forEach(mkey => {
      delete copied[mkey];
    });
    copied._src = obj.getOwnProp("_id");

    const id = this.create(copied);
    return this.fetch(id);
  }

  instanceIDs(cls) {
    // todo: 線形探索なのを高速化

    const cid = cls.get("_id", this);
    const isKindOfClass = v => {
      const tname = v.getOwnProp("_type");

      if (tname.origin === cid.origin) {
        return true;
      } else if (tname.origin === "Map") {
        return false;
      } else {
        const c = this.fetch(tname);
        if (c) {
          return isKindOfClass(c);
        } else {
          return false;
        }
      }
    };

    const results = [];
    const deleted = v("deleted");
    for (const [, obj] of this.objs) {
      const status = obj.get("_status", this);
      if (status && status.reduce(this).equals(deleted)) {
        continue;
      }

      if (isKindOfClass(obj) && !obj.isClass()) {
        const id = obj.getOwnProp("_id");
        results.push(id);
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

    while(acts) {
      if (!(acts instanceof CompArray)) {
        break;
      }

      if (acts.origin.length === 0) {
        break;
      }

      if (acts.origin.every(o => !(o instanceof Act))) {
        break;
      }

      if (acts.origin.some(o => !(o instanceof Act || o === null))) {
        throw `not all Act instances Array: ${acts.stringify()}`;
      }

      let lastAct;
      for (const act of acts.origin) {
        if (act === null) {
          continue;
        }

        let a = act;
        do {
          a = a.proceed(arg);
        } while(a.canProceed());

        lastAct = a;
      }

      acts = lastAct && lastAct.val;
    }
  }

  path(...args) {
    return path(...args);
  }
}
