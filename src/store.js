import { uuid } from './uuid';
import v from './v';
import Val from './val';
import Act from './act';
import Prim from './prim';
import Path, { path } from './path';
import Obj from './obj';
import Arr from './arr';

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
      _proto: "Store"
    });
    this.assign("currentStore", path(this.id));
  }

  doPut(obj) {
    const id = obj.getOwnProp("_id");
    this.objs.set(id.keyString(), obj);
  }

  putWithHandler(base, block) {
    // todo: ロックが実現の為に下記の一連の処理がアトミックな操作となるよううまく保証する

    const protoName = base.getOwnProp("_proto");
    if (protoName.constructor !== Prim || typeof(protoName.origin) !== "string") {
      throw `Bad proto name style: ${protoName.stringify()}`;
    }

    // todo: 本当はpathのreduceで対応したい
    // しかしまだstore未登録のObjなのでpathが利用できない
    // e.g.) obj = path(obj, ["onPut"]).reduce(this);
    const func = base.get("onPut", this);
    let obj = func.bind(base)(this);

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
      _proto: "Revision",
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

  convertPropObjToIdPath(jsobj) {
    const convert = obj => {
      if (!(obj instanceof Obj)) {
        return obj;
      }

      let id = obj.getOwnProp("_id");
      if (id) {
        return Path.parse(id);
      }

      return this.convertPropObjToIdPath(obj.origin);
    };

    const result = {};
    for (const key of Object.keys(jsobj)) {
      const prop = jsobj[key];
      const obj = v(prop);
      result[key] = convert(obj);
    }
    return result;
  }

  assign(key, val) {
    const idprop = { _id: key };

    const obj = v(val);
    const convert = this.convertPropObjToIdPath.bind(this);
    const props = obj instanceof Obj ? convert(obj.origin) : { _body: obj };

    const old = this.fetch(key);
    const orev = old && old.getOwnProp("_rev");
    const revprop = orev ? { _rev: orev } : {};

    const jsobj = Object.assign({}, idprop, props, revprop);
    const o = v(jsobj);
    this.put(o);
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
    const p = Path.parse(k);
    let obj = undefined;
    if (p.isPartial()) {
      for (key of p.keys) {
        obj = obj ? obj.get(key, this) : this.objs.get(key.keyString());
      }
    } else {
      obj = this.objs.get(k);
    }

    if (!obj) {
      const idstr = this.id.keyString();
      const sobj = this.objs.get(idstr);
      obj = sobj && sobj.getOriginProp(key);
    }

    return obj;
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
    return this.fetch(key);
  }

  match() {
    return false;
  }

  traversePropFromProto(obj, key) {
    const protoName = obj.getOwnProp("_proto");

    if (v(key).keyString() === protoName.keyString()) {
      return undefined;
    }

    const prototype = obj.get(protoName, this) || this.fetch(protoName);
    if (!prototype) {
      return undefined;
    }

    if (prototype instanceof Obj) {
      const p = prototype.getOriginProp(key);
      if (p) {
        return p;
      }
    }

    // Mapクラスの実態がObjのため、ifで無限再帰を抑制
    if (!obj.equals(prototype)) {
      const p = this.traversePropFromProto(prototype, key);
      if (p) {
        return p;
      }
    }

    {
      // JSPropは継承元prototypeのoriginPropを探索しきったあとで探索をかける
      const p = prototype.getJSProp(key);
      if (p) {
        return p;
      }
    }

    return undefined;
  }

  findPropFromStereotype(pth, key) {
    const receiver = pth.receiver;
    const parent = this.fetch(receiver);
    const steroName = parent && parent.get("_stereo", this);
    const sterotype = steroName && this.fetch(steroName);
    return (sterotype && sterotype.get(key, this)) || undefined;
  }

  findPropFromProto(obj, key) {
    const p = this.traversePropFromProto(obj, key);
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

    const vt = this.fetch("Val");
    const vp = vt && vt.getOriginProp(key);
    if (vp) {
      return vp;
    }

    const et = this.fetch("Entity");
    const ep = id && et && et.getOriginProp(key);
    if (ep) {
      return ep;
    }

    return undefined;
  }

  unpackProps(jsobj) {
    const result = {};

    for (const key of Object.keys(jsobj)) {
      let prop = jsobj[key];

      if (prop instanceof Val) {
        prop = prop.reduce(this).unpack();
      }

      result[key] = prop;
    }

    return result;
  }

  create(obj={}) {
    const jsobj = v(obj).origin;
    const o = Object.assign(
      {_id: uuid()},
      this.unpackProps(jsobj)
    );
    const id = o._id;
    if (id && this.fetch(id)) {
      throw `the object already exists. id: ${id}`;
    }

    this.assign(id, v(o));
    return id;
  }

  update(id, diff) {
    const obj = this.fetch(id);
    if (!obj) {
      throw `the object dose not exist. id: ${id}`;
    }

    this.patch(id, diff);
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

  copy(obj) {
    if (obj instanceof Prim) {
      const id = obj;
      obj = this.fetch(id);
    }

    const copied = Object.assign({}, obj.object(this));
    Obj.managedKeys.forEach(mkey => {
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
      const protoName = v.getOwnProp("_proto");

      if (protoName.origin === cid.origin) {
        return true;
      } else if (protoName.origin === "Obj") {
        return false;
      } else {
        const c = this.fetch(protoName);
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
    const id = obj instanceof Obj ? obj.getOwnProp("_id") : obj;
    return new Act(() => {
      this.set(id, key, val.unpack());
    });
  }

  run(e, arg) {
    let acts = e.reduce(this);
    if (acts instanceof Act) {
      acts = v([acts]);
    }

    while(acts) {
      if (!(acts instanceof Arr)) {
        break;
      }

      if (acts.origin.length === 0) {
        break;
      }

      if (acts.origin.every(o => !(o instanceof Act))) {
        break;
      }

      if (acts.origin.some(o => !(o instanceof Act || o === null))) {
        throw `not all Act instances Arr: ${acts.stringify()}`;
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
