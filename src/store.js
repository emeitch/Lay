import UUID from './uuid';
import v from './v';
import Ref, { ref } from './ref';
import Sym from './sym';
import Act from './act';
import ID from './id';
import Prim from './prim';
import Path from './path';
import Comp, { CompMap } from './comp';
import { parseRef } from './parser';

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
      _type: ref("Store")
    });
    this.assign("currentStore", ref(this.id));
  }

  parseRef(...args) {
    return parseRef(...args);
  }

  doPut(obj) {
    const id = obj.getOwnProp("_id");

    this.objs.set(id.keyString(), obj);
  }

  putWithHandler(obj, block) {
    // todo: ロックが実現の為に下記の一連の処理がアトミックな操作となるよううまく保証する

    const tprop = obj.getOwnProp("_type");
    if (!(tprop instanceof Sym) && tprop.constructor !== Ref) {
      throw `bad type reference style: ${tprop.stringify()}`;
    }

    let id = obj.getOwnProp("_id");
    if (id instanceof Path) {
      const pth = id;
      const parent = pth.parent();
      if (pth.keys.every(i => i instanceof Prim)) {
        // partial embeded obj
        id = pth.receiver;
        const base = this.fetch(id) || v({_id: id});
        const diff = pth.diff(obj);
        obj = base.patch(diff);
      } else if (pth.keys.some(i => Array.isArray(i))) {
        throw `cannot set method applying path to _id: ${pth}`;
      } else if (pth.keys.some(i => !(i instanceof ID))) {
        throw "intermediate objs are not context objs";
      } else if (parent.reduce(this).equals(parent)) {
        throw "intermediate objs not found";
      }
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

    const rid = new UUID();
    const rev = v({
      _id: rid.keyVal(),
      _rev: rid,
      _type: ref("Revision"),
      at: v(new Date())
    });
    const withMeta = {
      _rev: rid
    };
    if (prid) {
      withMeta._prev = prid;
    }
    if (id instanceof Ref || id instanceof ID || id instanceof Path) {
      withMeta._id = id.keyVal();
    }

    const o = obj.patch(withMeta);
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
          _target: obj
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

  fetchWithoutImports(key) {
    return this.objs.get(key.keyString());
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
      key = v(key);
    }

    return this.fetchWithoutImports(key) || this.fetchWithImports(store => store.fetchWithoutImports(key));
  }

  get(key) {
    return this.fetch(key) || key;
  }

  match() {
    return false;
  }

  resolve(ref) {
    let obj = ref;
    while(obj instanceof Ref || obj instanceof ID || obj instanceof Sym) {
      obj = this.fetch(obj);
      obj = obj && obj.reduce(this); // for _target reducing
    }

    return obj ? obj : ref;
  }

  traversePropFromType(obj, key) {
    const tref = obj.getOwnProp("_type");
    const tobj = tref.reduce(this);
    if (tref.equals(tobj)) {
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

  findPropFromType(obj, key) {
    const p = this.traversePropFromType(obj, key);
    if (p) {
      return p;
    }

    const ot = this.fetch("Object");
    const op = ot && ot.getCompProp(key);
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

    const cid = cls.get("_id", this);
    const results = [];
    for (const [kstr, val] of this.objs) {
      const status = val.get("_status", this);
      if (status.reduce(this).equals(v("deleted", null))) {
        continue;
      }

      const key = this.parseRef(kstr);
      const tref = val.get("_type", this);
      const tname = tref.keyString();
      if (tname === cid.origin) {
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

    do {
      if (acts instanceof Comp && Array.isArray(acts.origin)) {
        for (act of acts.origin) {
          if (act === null) {
            continue;
          }

          if (!(act instanceof Act)) {
            throw `not Act instance: ${act}`;
          }

          do {
            act = act.proceed(arg);
          } while(act.canProceed());
        }
      }

      acts = act && act.val;
    } while(
      acts instanceof Comp &&
      Array.isArray(acts.origin) &&
      acts.origin.length > 0 &&
      acts.origin.every(o => o instanceof Act || o === null)
    );
  }

  path(base, ...keys) {
    if (base instanceof Path) {
      return new Path(...base.origin.concat(keys));
    } else {
      return new Path(base, ...keys);
    }
  }
}
