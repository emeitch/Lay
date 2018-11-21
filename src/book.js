import Val from './val';
import v from './v';
import UUID from './uuid';
import LID from './lid';
import Edge from './edge';
import Comp from './comp';
import Case from './case';
import Act from './act';
import Path, { path } from './path';
import { exp } from './exp';

const subjectLabel = "subject";
const typeLabel = "type";
const objectLabel = "object";

const fromLabel = "from";
const toLabel = "to";

export default class Book {
  constructor(...imports) {
    this.edges = [];
    this.edgeByTailAndLabelCache = new Map();
    this.edgesByLabelAndHeadCache = new Map();
    this.relsCache = new Map();
    this.relsByTypeAndObjectCache = new Map();
    this.relsBySubjectAndObjectCache = new Map();

    this.id = new UUID();
    this.root = new LID();
    this.keysCache = new Map();
    this.parentsCache = new Map();

    this.imports = [];
    for (const i of imports) {
      this.import(i);
    }

    this.set("currentBookId", this.id);
    this.put(this.id, typeLabel, path("Book"));
  }

  cacheIndex(id, key) {
    key = v(key);
    return Val.stringify(id) + "__" + Val.stringify(key);
  }

  relsMap(id, key) {
    const i = this.cacheIndex(id, key);
    return this.relsCache.get(i) || new Map();
  }

  relsOnlySelf(id, key) {
    return [...this.relsMap(id, key).values()];
  }

  rels(id, key) {
    return this.traverseImports(
      (book, current) => {
        const result = book.relsOnlySelf(id, key);
        return current.concat(result);
      },
      []);
  }

  relsByTypeAndObjectMap(key, val) {
    const i = this.cacheIndex(key, val);
    return this.relsByTypeAndObjectCache.get(i) || new Map();
  }

  relsByTypeAndObjectOnlySelf(key, val) {
    return [...this.relsByTypeAndObjectMap(key, val).values()];
  }

  relsByTypeAndObject(key, val) {
    return this.traverseImports(
      (book, current) => {
        const result = book.relsByTypeAndObjectOnlySelf(key, val);
        return current.concat(result);
      },
      []);
  }

  relsBySubjectAndObjectMap(id, val) {
    const i = this.cacheIndex(id, val);
    return this.relsBySubjectAndObjectCache.get(i) || new Map();
  }

  relsBySubjectAndObjectOnlySelf(id, val) {
    return [...this.relsBySubjectAndObjectMap(id, val).values()];
  }

  relsBySubjectAndObject(id, val) {
    return this.traverseImports(
      (book, current) => {
        const result = book.relsBySubjectAndObjectOnlySelf(id, val);
        return current.concat(result);
      },
      []);
  }

  active(rels, at=new Date()) {
    return rels.filter(r => {
      const from = this.getEdgeHead(r, fromLabel);
      const to = this.getEdgeHead(r, toLabel);
      return (!to || to.origin > at) && (!from || from.origin < at);
    });
  }

  activeRels(id, key, at) {
    return this.active(this.rels(id, key), at);
  }

  activeRel(id, key, at) {
    const actives = this.activeRels(id, key, at);
    return actives[actives.length-1];
  }

  activeRelsByTypeAndObject(key, val, at) {
    return this.active(this.relsByTypeAndObject(key, val), at);
  }

  findRelWithType(id, key) {
    const rel = this.activeRel(id, key);
    if (rel) {
      return rel;
    }

    const trels = this.activeRels(id, typeLabel);
    for (const trel of trels) {
      const v = this.getEdgeHead(trel, objectLabel);
      const p = v.replaceSelfBy(id).reduce(this);
      const r = this.findRelWithType(p, key);
      if (r) {
        return r;
      }
    }

    const orel = this.activeRel(this.get("Object"), key);
    if (orel) {
      return orel;
    }

    return undefined;
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

  new(props) {
    const id = new UUID();

    if (props) {
      for (const key of Object.keys(props)) {
        const val = v(props[key]).reduce(this);
        this.put(id, key, val);
      }
    }

    this.put(id, "exists", v(true));

    return id;
  }

  get(name) {
    const rel = this.fetchWithImports(book => book.activeRel(book.id, name));
    return rel ? this.getEdgeHead(rel, objectLabel) : undefined;
  }

  set(name, id) {
    this.setProperty(this.id, name, id);
  }

  name(id) {
    const rels = this.relsBySubjectAndObject(this.id, id);
    return rels.length > 0 ? this.getEdgeHead(rels[0], typeLabel) : v(null);
  }

  getEdgeByTailAndLabel(tail, labelSrc) {
    const label = v(labelSrc);
    const i = this.cacheIndex(tail, label);
    return this.fetchWithImports(book => book.edgeByTailAndLabelCache.get(i));
  }

  getEdgeHead(tail, label) {
    const edge = this.getEdgeByTailAndLabel(tail, label);
    return edge && edge.head;
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

  traverseImports(traverser, current) {
    this.iterateImports(book => {
      current = traverser(book, current);
      return false;
    });
    return current;
  }

  fetchWithImports(fetcher) {
    let result = undefined;
    this.iterateImports(book => {
      result = fetcher(book);
      return result;
    });
    return result;
  }

  getEdgesByLabelAndHead(labelSrc, head) {
    const label = v(labelSrc);
    return this.traverseImports(
      (book, current) => {
        const i = book.cacheIndex(label, head);
        const res = book.edgesByLabelAndHeadCache.get(i) || [];
        return current.concat(res);
      },
      []);
  }

  getEdgeTails(label, head) {
    return this.getEdgesByLabelAndHead(label, head).map(e => e.tail);
  }

  getEdgesBySubject(subject) {
    return this.getEdgesByLabelAndHead(subjectLabel, subject);
  }

  getEdgesByObject(object) {
    return this.getEdgesByLabelAndHead(objectLabel, object);
  }

  syncEdgeCache(edge) {
    {
      const i = this.cacheIndex(edge.tail, edge.label);
      this.edgeByTailAndLabelCache.set(i, edge);
    }

    {
      const i = this.cacheIndex(edge.label, edge.head);
      const edges = this.edgesByLabelAndHeadCache.get(i) || [];
      edges.push(edge);
      this.edgesByLabelAndHeadCache.set(i, edges);
    }

    {
      const se = this.getEdgeByTailAndLabel(edge.tail, subjectLabel);
      const te = this.getEdgeByTailAndLabel(edge.tail, typeLabel);
      const oe = this.getEdgeByTailAndLabel(edge.tail, objectLabel);

      if (se && te) {
        const i = this.cacheIndex(se.head, te.head);
        const ar = this.relsCache.get(i) || new Map();
        const s = Val.stringify(edge.tail);
        if (!ar.has(s)) {
          ar.set(s, edge.tail);
          this.relsCache.set(i, ar);
        }
      }

      if (te && oe) {
        const i = this.cacheIndex(te.head, oe.head);
        const ar = this.relsByTypeAndObjectCache.get(i) || new Map();
        const s = Val.stringify(edge.tail);
        if (!ar.has(s)) {
          ar.set(s, edge.tail);
          this.relsByTypeAndObjectCache.set(i, ar);
        }
      }

      if (se && oe) {
        const i = this.cacheIndex(se.head, oe.head);
        const ar = this.relsBySubjectAndObjectCache.get(i) || new Map();
        const s = Val.stringify(edge.tail);
        if (!ar.has(s)) {
          ar.set(s, edge.tail);
          this.relsBySubjectAndObjectCache.set(i, ar);
        }
      }
    }
  }

  putEdge(tail, label, head, rev) {
    return this.doTransaction((_, putEdgeWithTransaction) => {
      return putEdgeWithTransaction(tail, label, head, rev);
    });
  }

  appendEdge(tail, label, head, rev) {
    const edge = new Edge(tail, label, head, rev);
    this.edges.push(edge);
    this.syncEdgeCache(edge);
    return edge;
  }

  invalidate(rel) {
    return this.doTransaction((_, __, invalidateWithTransaction) => {
      return invalidateWithTransaction(rel);
    });
  }

  doTransaction(block) {
    const tid = new UUID();

    // todo: アトミックな操作に修正する
    const append = (id, key, val) => {
      const tail = new UUID();
      const edges = [];
      edges.push(this.appendEdge(tail, typeLabel, key, tid));
      edges.push(this.appendEdge(tail, subjectLabel, id, tid));
      if (val !== undefined) {
        edges.push(this.appendEdge(tail, objectLabel, val, tid));
      }
      return edges;
    };

    const putWithTransaction = (...args) => {
      const edges = [];
      edges.push(...append(...args));
      edges.push(...append(tid, "at", v(new Date())));
      edges.push(...append(tid, typeLabel, path("Transaction")));
      return edges;
    };

    const putEdgeWithTransaction = (tail, label, head, rev) => {
      return this.appendEdge(tail, label, head, rev || tid);
    };

    const invalidateWithTransaction = rel => {
      return this.appendEdge(rel, toLabel, v(new Date()), tid);
    };

    return block(putWithTransaction, putEdgeWithTransaction, invalidateWithTransaction);
  }

  doPut(...args) {
    return this.doTransaction(putWithTransaction => {
      return putWithTransaction(...args);
    });
  }

  getOnPutsRels() {
    return this.traverseImports(
      (book, current) =>
        current.concat(book.activeRels(book.id, "onPut")),
        []);
  }

  handleOnPut(edges) {
    const rels = this.getOnPutsRels();
    for (const rel of rels) {
      const actexp = this.getEdgeHead(rel, objectLabel);
      const act = actexp.reduce(this);
      this.run(act, edges);
    }
  }

  putPath(pth) {
    const keys = [];
    const rels = [];
    for(const key of pth.origin) {
      keys.push(key);
      const rel = this.exist(...keys);
      const val = this.getEdgeHead(rel, objectLabel);
      if (!(val instanceof LID)) {
        throw `can't put val for not ID object: ${val}(${keys})`;
      }
      rels.push(rel);
    }
    return rels;
  }

  put(...args) {
    if (args[0] instanceof Path) {
      const pth = args[0];
      const rels = this.putPath(pth);
      const rel = rels[rels.length-1];
      args[0] = this.getEdgeHead(rel, objectLabel);
    }

    const edges = this.doPut(...args);
    this.handleOnPut(edges);
    return edges[0].tail; // todo: 返し方が微妙なので修正したい
  }

  putAct(...args) {
    return new Act(() => {
      return this.put(...args);
    });
  }

  setProperty(id, key, val) {
    for (const rel of this.activeRels(id, key)) {
      this.invalidate(rel);
    }

    if (val.equals(v(null))) {
      return v(null);
    }

    return this.put(id, key, val);
  }

  setAct(id, key, val) {
    return new Act(() => {
      return this.setProperty(id, key, val);
    });
  }

  create(receiver, key) {
    const obj = new LID();
    this.keysCache.set(obj, key);
    this.parentsCache.set(obj, receiver);
    return this.put(receiver, key, obj);
  }

  exist(...keys) {
    let parent = this.root;
    let rel;
    for (const key of keys) {
      rel = this.activeRel(parent, key) || this.create(parent, key);
      parent = this.getEdgeHead(rel, objectLabel);
    }
    return rel;
  }

  key(obj) {
    return this.keysCache.get(obj);
  }

  parent(obj) {
    return this.parentsCache.get(obj);
  }

  path(obj) {
    const keys = [];
    while (!obj.equals(this.root)) {
      keys.unshift(this.key(obj));
      obj = this.parent(obj);
    }
    keys.unshift(v("/"));
    return path(...keys);
  }

  fetch(keys, obj=this.root, filter=(o, _self) => o) {
    if (keys.length === 0) {
      return obj;
    }

    const ks = keys.concat();
    let key = ks.shift();
    let args = [];
    if (Array.isArray(key)) {
      args = key.concat();
      key = args.shift();
    }
    const rel = this.activeRel(obj, key);
    const val = rel ? this.getEdgeHead(rel, objectLabel) : undefined;
    const o = val ? this.fetch(ks, val, filter) : undefined;
    return filter(o, obj, args);
  }

  query(keys, obj=this.root) {
    return this.fetch(keys, obj, (o, self, args) => {
      // todo: この部分がpath前提の書き方になってるのでいつか直す
      if (o && o.reducible) {
        if (o instanceof Case) {
          const c = o.replaceSelfBy(self);
          const as = args.map(a => a.replaceSelfBy(self));
          const e = exp(c, ...as);
          return e.reduce(this).replaceSelfBy(self);
        }

        const ks = o.origin.concat();
        if (ks[0].equals(v("/"))) {
          ks.shift();
          return this.query(ks, this.root);
        } else {
          return this.query(ks, self) || o;
        }
      }

      return o;
    });
  }

  instanceIDs(id) {
    const name = this.name(id);
    if (name.origin === null) {
      return [];
    }
    const sname = path(name.origin);
    const rels = this.activeRelsByTypeAndObject(v(typeLabel), sname);
    return rels.map(
      rel => this.getEdgeHead(rel, subjectLabel)
    ).filter(id => {
      const rs = this.activeRels(id, v("exists"));
      const r = rs[rs.length-1];
      return r && this.getEdgeHead(r, objectLabel).origin;
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

    return act ? act.val : null;
  }
}
