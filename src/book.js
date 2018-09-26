import _ from 'lodash';
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
    this.tailLabelCache = new Map();
    this.edgesBySubjectCache = new Map();
    this.edgesByObjectCache = new Map();

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

  log(logid) {
    return this.logs.get(logid);
  }

  findLogs(condition) {
    const cond = {};
    Object.keys(condition).forEach(k => {
      if (typeof(condition[k]) === "string") {
        cond[k] = v(condition[k]);
      } else {
        cond[k] = condition[k];
      }
    });

    let logs = [];
    for (const imported of this.imports) {
      const ls = imported.findLogs(cond);
      if (ls.length > 0) {
        logs = logs.concat(ls);
      }
    }

    // todo: 線形探索になっているので高速化する
    for (const [, log] of this.logs) {
      const keys = Object.keys(cond);
      if (keys.every((k) => Val.stringify(log[k]) === Val.stringify(cond[k]))) {
        logs.push(log);
      }
    }

    return logs;
  }

  cacheIndex(id, key) {
    key = v(key);
    return Val.stringify(id) + "__" + Val.stringify(key);
  }

  findActiveLogs(cond) {
    const logs = [];
    for (const log of this.findLogs(cond)) {
      const i = this.cacheIndex(log.id, log.key);
      const ilogs = new Map(this.invalidationLogsCache.get(i));

      let invalidated = false;
      for (let [, ilog] of ilogs) {
        if (ilog.id.equals(log.logid)) {
          invalidated = true;
          break;
        }
      }

      if (!invalidated) {
        logs.push(log);
      }
    }

    return logs;
  }

  activeLogs(id, key, at=new Date()) {
    const i = this.cacheIndex(id, key);
    const alogs = new Map(this.activeLogsCache.get(i));
    const ilogs = new Map(this.invalidationLogsCache.get(i));

    for (let [, log] of alogs) {
      if (log.at.origin && log.at.origin > at) {
        alogs.delete(log.logid);
      }
    }

    for (let [, ilog] of ilogs) {
      const log = alogs.get(ilog.id);
      if (log && (!ilog.at.origin || ilog.at.origin <= at)) {
        alogs.delete(log.logid);
      }
    }

    const actives = Array.from(alogs.values()).sort((a, b) => {
      // todo: atが重複した場合に順序が制御されないのをどうにかする
      return a.at.origin.getTime() - b.at.origin.getTime();
    });

    if (actives.length > 0) {
      return actives;
    }

    for (const imported of this.imports) {
      const logs = imported.activeLogs(id, key, at);
      if (logs.length > 0) {
        return logs;
      }
    }

    return [];
  }

  activeLog(id, key, at=new Date()) {
    const actives = this.activeLogs(id, key, at);
    return actives[actives.length-1];
  }

  findLogWithType(id, key) {
    const log = this.activeLog(id, key);
    if (log) {
      return log;
    }

    const tlogs = this.activeLogs(id, "type");
    for (const tlog of tlogs) {
      const p = tlog.val.replaceSelfBy(id).reduce(this);
      const l = this.findLogWithType(p, key);
      if (l) {
        return l;
      }
    }

    const olog = this.activeLog(this.get("Object"), key);
    if (olog) {
      return olog;
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

  existsIDs() {
    const logs = this.findActiveLogs({key: v("exists")});
    const ids = _.uniq(logs.map(l => l.id));
    return ids;
  }

  transactionID(log) {
    const tlogs = this.findActiveLogs({id: log.logid, key: transaction});

    if (tlogs.length === 0) {
      return null;
    }

    const tlog = tlogs[0];
    const tid = tlog.val;
    return tid;
  }

  get(name) {
    const logs = this.findActiveLogs({id: v(name), key: assign});
    const log = logs[logs.length-1];
    if (log) {
      return log.val;
    }

    return undefined;
  }

  set(name, id) {
    // todo: ユニーク制約をかけたい
    const log = new Log(v(name), assign, id);
    this.putLog(log);
  }

  name(id) {
    const logs = this.findActiveLogs({key: assign, val: id});
    return logs.length > 0 ? logs[0].id : v(null);
  }

  getEdgeHead(tail, label) {
    const i = this.cacheIndex(tail, label);
    return this.tailLabelCache.get(i);
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
      this.tailLabelCache.set(i, edge.head);
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
  }

  syncCache(log) {
    const i = this.cacheIndex(log.id, log.key);
    const al = this.activeLogsCache.get(i) || new Map();
    al.set(log.logid, log);
    this.activeLogsCache.set(i, al);

    if (log.key === invalidate) {
      const positive = this.log(log.id);
      const i = this.cacheIndex(positive.id, positive.key);
      const il = this.invalidationLogsCache.get(i) || new Map();
      il.set(log.logid, log);
      this.invalidationLogsCache.set(i, il);
    }

    {
      const i = this.cacheIndex(log.val, log.key);
      const ids = [...this.dereferenceCache.get(i) || [], log.id];
      this.dereferenceCache.set(i, ids);
    }
  }

  doTransaction(block) {
    const tid = new UUID();
    const ttlog = new Log(tid, transactionTime, v(new Date()));

    const appendEdge = (tail, label, head) => {
      const edge = new Edge(tail, label, head);
      this.edges.push(edge);
      this.syncEdgeCache(edge);
    };

    // todo: アトミックな操作に修正する
    const appendLog = (log) => {
      this.logs.set(log.logid, log);
      this.syncCache(log);

      appendEdge(log.logid, "type", log.key);
      appendEdge(log.logid, "subject", log.id);
      appendEdge(log.logid, "object", log.val);
    };

    appendLog(ttlog);

    const putWithTransaction = (log) => {
      appendLog(log);
      const tlog = new Log(log.logid, transaction, tid);
      appendLog(tlog);
      return log;
    };
    return block(putWithTransaction);
  }

  doPutLog(log) {
    return this.doTransaction(putWithTransaction => {
      return putWithTransaction(log);
    });
  }

  handleOnPut(log) {
    const alogs = this.findActiveLogs({id: "onPut"});
    for (const alog of alogs) {
      const actexp = alog.val;
      const act = actexp.reduce(this);
      this.run(act, log);
    }
  }

  putLog(log) {
    const result = this.doPutLog(log);
    this.handleOnPut(log);
    return result;
  }

  putPath(pth) {
    const keys = [];
    const logs = [];
    for(const key of pth.origin) {
      keys.push(key);
      const log = this.exist(...keys);
      if (!(log.val instanceof LID)) {
        throw `can't put val for not ID object: ${log.val}(${keys})`;
      }
      logs.push(log);
    }
    return logs;
  }

  put(...args) {
    if (args[0] instanceof Path) {
      const pth = args[0];
      const logs = this.putPath(pth);
      args[0] = logs[logs.length-1].val;
    }

    const log = new Log(...args);
    return this.putLog(log);
  }

  putAct(...args) {
    return new Act(() => {
      return this.put(...args);
    });
  }

  setAct(...args) {
    return new Act(() => {
      const log = new Log(...args);
      for (const l of this.activeLogs(log.id, log.key)) {
         this.put(l.logid, invalidate);
      }
      return this.putLog(log);
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
    let log;
    for (const key of keys) {
      log = this.activeLog(parent, key) || this.create(parent, key);
      parent = log.val;
    }
    return log;
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
    const log = this.activeLog(obj, key);
    const val = log ? log.val : undefined;
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
    const logs = this.findActiveLogs({key: "type", val: sname});
    return logs.filter(log => {
      const es = this.findActiveLogs({id: log.id, key: "exists"});
      return es.length > 0 && es[es.length-1].val.origin;
    }).map(log => log.id);
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
