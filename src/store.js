import UUID from './uuid';
import Edge from './edge';
import { sym } from './sym';
import { path } from './path';
import v from './v';
import Act from '../src/act';
import Comp from './comp';

export default class Store {
  constructor(...imports) {
    this.objs = new Map();

    this.imports = [];
    for (const i of imports) {
      this.import(i);
    }
  }

  convertStringKey(key) {
    return JSON.stringify(v(key).object());
  }

  convertObjectKey(key) {
    return parseVal(JSON.parse(key));
  }

  set(key, val) {
    const k = this.convertStringKey(key);
    this.objs.set(k, v(val));
  }

  getWithoutImports(key) {
    const k = this.convertStringKey(key);
    return this.objs.get(k);
  }

  import(other, _name) {
    this.imports.push(other);
    // this.handleOnInport(other);

    // if (typeof(name) === "string") {
    //   this.set(name, other.id);
    // }
  }

  iterateImports(block) {
    let stop = block(this);
    for (const imported of this.imports) {
      // if (stop) {
      //   break;
      // }
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

  getProp(id, key) {
    return this.findPropWithType(id, key);
  }

  findPropWithType(id, key) {
    const val = this.get(id);
    if (!val) {
      return undefined;
    }

    const prop = val.get(key, this);
    if (prop) {
      return prop;
    }

    const tprop = val.get("type", this);
    const tprops = tprop.type.equals(sym("Array")) ? tprop : v([tprop]);
    for (const tref of tprops.origin) {
      const t = tref.replaceSelfBy(id).reduce(this);
      const p = t.get(key, this);
      if (p) {
        return p;
      }
    }

    const ot = this.get("Object");
    const op = ot && ot.get(key, this);
    if (op) {
      return op;
    }

    return undefined;
  }

  new(obj={}) {
    const id = new UUID();
    this.set(id, v(obj));
    return id;
  }

  instanceIDs(cls) {
    // todo: 線形探索なのを高速化
    const results = [];
    for (const [k, val] of this.objs) {
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

export function parsePairs(raws) {
  const pairs = [];
  for (const raw of raws) {
    const pair = {
      key: parseVal(raw.key),
      val: parseVal(raw.val)
    };
    pairs.push(pair);
  }
  return pairs;
}

export function parseEdges(raws) {
  const edges = [];
  for (const raw of raws) {
    const tail = parseVal(raw.tail);
    const label = raw.label;
    const head = parseVal(raw.head);
    const rev = parseVal(raw.rev);
    const edge = new Edge(v(tail), label, v(head), rev);
    edges.push(edge);
  }
  return edges;
}
