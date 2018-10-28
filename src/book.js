import Val from './val';
import v from './v';
import UUID from './uuid';
import LID from './lid';
import Edge from './edge';
import Log from './log';
import Comp from './comp';
import Case from './case';
import Act from './act';
import Path, { path } from './path';
import { exp } from './exp';
import { assign, transaction, transactionTime, invalidate } from './ontology';

export default class Book {
  constructor(...imports) {
    this.edges = [];
    this.edgeByTailAndLabelCache = new Map();
    this.edgesByLabelAndHeadCache = new Map();
    this.edgesBySubjectCache = new Map();
    this.edgesByObjectCache = new Map();
    this.relsCache = new Map();
    this.relsByTypeAndObjectCache = new Map();

    this.id = new UUID();
    this.root = new LID();
    this.logs = new Map();
    this.keysCache = new Map();
    this.parentsCache = new Map();
    this.dereferenceCache = new Map();
    this.activeLogsCache = new Map();
    this.invalidationLogsCache = new Map();
    this.imports = [];
    for (const i of imports) {
      this.import(i);
    }

    this.set("currentBookId", this.id);
    this.put(this.id, "type", path("Book"));

    this.lay_logs = new Map();
  }

  // todo: invalidation対応で後日取り除く
  // log(logid) {
  //   return this.logs.get(logid);
  // }

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
    const results = this.relsOnlySelf(id, key);
    for (const i of this.imports) {
      results.push(...i.rels(id, key));
    }
    return results;
  }

  relsByTypeAndObjectMap(key, val) {
    const i = this.cacheIndex(key, val);
    return this.relsByTypeAndObjectCache.get(i) || new Map();
  }

  relsByTypeAndObjectOnlySelf(key, val) {
    return [...this.relsByTypeAndObjectMap(key, val).values()];
  }

  relsByTypeAndObject(key, val) {
    const results = this.relsByTypeAndObjectOnlySelf(key, val);
    for (const i of this.imports) {
      results.push(...i.relsByTypeAndObject(key, val));
    }
    return results;
  }

  active(rels, at=new Date()) {
    return rels.filter(r => {
      const from = this.getEdgeHead(r, "from");
      const to = this.getEdgeHead(r, "to");
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

    const trels = this.activeRels(id, "type");
    for (const trel of trels) {
      const v = this.getEdgeHead(trel, "object");
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

  transactionID(rel) {
    const trel = this.activeRel(rel, transaction);
    return this.getEdgeHead(trel, "subject");
  }

  get(name) {
    const rels = this.activeRels(v(name), assign);
    const rel = rels[0];
    if (rel) {
      return this.getEdgeHead(rel, "object");
    }

    return undefined;
  }

  set(name, id) {
    // todo: ユニーク制約をかけたい
    this.put(v(name), assign, id);
  }

  name(id) {
    const rels = this.relsByTypeAndObject(assign, id);
    return rels.length > 0 ? this.getEdgeHead(rels[0], "subject") : v(null);
  }

  getEdgeByTailAndLabel(tail, label) {
    const i = this.cacheIndex(tail, label);
    const edge = this.edgeByTailAndLabelCache.get(i);
    if (edge) {
      return edge;
    }

    for (const imported of this.imports) {
      const e = imported.getEdgeByTailAndLabel(tail, label);
      if (e) {
        return e;
      }
    }

    return undefined;
  }

  getEdgeHead(tail, label) {
    const edge = this.getEdgeByTailAndLabel(tail, label);
    return edge && edge.head;
  }

  getEdgesByLabelAndHead(label, head) {
    const i = this.cacheIndex(label, head);
    const results = [];
    const edges = this.edgesByLabelAndHeadCache.get(i) || [];
    results.push(...edges);

    for (const imported of this.imports) {
      results.push(...imported.getEdgesByLabelAndHead(label, head));
    }

    return results;
  }

  getEdgeTails(label, head) {
    return this.getEdgesByLabelAndHead(label, head).map(e => e.tail);
  }

  getEdgesBySubject(subject) {
    const i = Val.stringify(subject);
    return this.edgesBySubjectCache.get(i) || [];
  }

  getEdgesByObject(object) {
    const i = Val.stringify(object);
    return this.edgesByObjectCache.get(i) || [];
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

    if (edge.label === "subject") {
      const i = Val.stringify(edge.head);
      const edges = this.edgesBySubjectCache.get(i) || [];
      edges.push(edge);
      this.edgesBySubjectCache.set(i, edges);
    }

    if (edge.label === "object") {
      const i = Val.stringify(edge.head);
      const edges = this.edgesByObjectCache.get(i) || [];
      edges.push(edge);
      this.edgesByObjectCache.set(i, edges);
    }

    {
      const se = this.getEdgeByTailAndLabel(edge.tail, "subject");
      const te = this.getEdgeByTailAndLabel(edge.tail, "type");
      const oe = this.getEdgeByTailAndLabel(edge.tail, "object");

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
    }
  }

  syncCache(log) {
    {
      const i = this.cacheIndex(log.id, log.key);
      const al = this.activeLogsCache.get(i) || new Map();
      al.set(log.logid, log);
      this.activeLogsCache.set(i, al);
    }

    if (log.key === invalidate) {
      // todo: invalidation対応で後日取り除く
      // const positive = this.log(log.id);
      // if (positive) {
      //   const i = this.cacheIndex(positive.id, positive.key);
      //   const il = this.invalidationLogsCache.get(i) || new Map();
      //   il.set(log.logid, log);
      //   this.invalidationLogsCache.set(i, il);
      // }

      this.putEdge(log.id, "to", v(new Date()));
    }

    {
      const i = this.cacheIndex(log.val, log.key);
      const ids = [...this.dereferenceCache.get(i) || [], log.id];
      this.dereferenceCache.set(i, ids);
    }
  }

  transactionIdFromEdge(edge) {
    const e = this.getEdgeByTailAndLabel(edge.tail, edge.label);
    return e.rev;
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

  doTransaction(block) {
    const tid = new UUID();
    const ttlog = new Log(tid, transactionTime, v(new Date()));

    // todo: アトミックな操作に修正する
    const appendLog = (log) => {
      this.logs.set(log.logid, log);
      this.syncCache(log);

      const edges = [];
      edges.push(this.appendEdge(log.logid, "type", log.key, tid));
      edges.push(this.appendEdge(log.logid, "subject", log.id, tid));
      edges.push(this.appendEdge(log.logid, "object", log.val, tid));
      return edges;
    };

    appendLog(ttlog);

    const putWithTransaction = (...args) => {
      const log = new Log(...args);
      const edges = appendLog(log);
      const tlog = new Log(log.logid, transaction, tid);
      edges.concat(appendLog(tlog));
      return edges;
    };

    const putEdgeWithTransaction = (tail, label, head, rev) => {
      return this.appendEdge(tail, label, head, rev);
    };

    return block(putWithTransaction, putEdgeWithTransaction);
  }

  doPut(...args) {
    return this.doTransaction(putWithTransaction => {
      return putWithTransaction(...args);
    });
  }

  handleOnPut(edges) {
    const rels = this.activeRels(v("onPut"), assign);
    for (const rel of rels) {
      const actexp = this.getEdgeHead(rel, "object");
      const act = actexp.reduce(this);
      for (const edge of edges) {
        this.run(act, edge);
      }
    }
  }

  putPath(pth) {
    const keys = [];
    const rels = [];
    for(const key of pth.origin) {
      keys.push(key);
      const rel = this.exist(...keys);
      const val = this.getEdgeHead(rel, "object");
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
      args[0] = this.getEdgeHead(rel, "object");
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

  setAct(id, key, val) {
    return new Act(() => {
      for (const rel of this.activeRels(id, key)) {
         this.put(rel, invalidate);
      }
      return this.put(id, key, val);
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
      parent = this.getEdgeHead(rel, "object");
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
    const val = rel ? this.getEdgeHead(rel, "object") : undefined;
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

  derefer(pth, key) {
    const i = this.cacheIndex(pth, key);
    const logs = this.dereferenceCache.get(i);
    return v(logs);
  }

  instanceIDs(id) {
    const name = this.name(id);
    if (name.origin === null) {
      return [];
    }
    const sname = path(name.origin);
    const rels = this.activeRelsByTypeAndObject(v("type"), sname);
    return rels.map(
      rel => this.getEdgeHead(rel, "subject")
    ).filter(id => {
      const rs = this.activeRels(id, v("exists"));
      const r = rs[rs.length-1];
      return r && this.getEdgeHead(r, "object").origin;
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

  logIDs() {
    const logids = [];
    for (const [, log] of this.logs) {
      logids.push(log.logid);
    }

    return logids.concat(this.imports.reduce((r, i) => r.concat(i.logIDs()), []));
  }
}
