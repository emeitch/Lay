import _ from 'lodash';
import Val from './val';
import v from './v';
import UUID from './uuid';
import LID from './lid';
import Log from './log';
import Comp from './comp';
import Act from './act';
import { path } from './path';
import { assign, transaction, transactionTime, invalidate } from './ontology';

export default class Book {
  constructor(...imports) {
    this.id = new UUID();
    this.lid = new LID();
    this.logs = new Map();
    this.keysCache = new Map();
    this.referersCache = new Map();
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
      if (log.at && log.at > at) {
        alogs.delete(log.logid);
      }
    }

    for (let [, ilog] of ilogs) {
      const log = alogs.get(ilog.id);
      if (log && (!ilog.at || ilog.at <= at)) {
        alogs.delete(log.logid);
      }
    }

    const actives = Array.from(alogs.values()).sort((a, b) => {
      // todo: atが重複した場合に順序が制御されないのをどうにかする
      return a.at.getTime() - b.at.getTime();
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

    const rawlog = this.log(id);
    if (rawlog && rawlog[key]) {
      // todo: アドホックなログとしてlogidが存在しないなど特殊な扱いにしたい
      return new Log(id, key, rawlog[key]);
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
  }

  doTransaction(block) {
    // todo: アトミックな操作に修正する
    const appendLog = (log) => {
      this.logs.set(log.logid, log);
      this.syncCache(log);
    };
    const tid = new UUID();
    const ttlog = new Log(tid, transactionTime, v(new Date()));

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

  put(...args) {
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
    this.referersCache.set(obj, receiver);
    return this.put(receiver, key, obj);
  }

  exist(key) {
    return this.create(this.lid, key);
  }

  key(obj) {
    return this.keysCache.get(obj);
  }

  referer(obj) {
    return this.referersCache.get(obj);
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

  lay_keystr(key) {
    return key instanceof Val ? key.stringify() : key;
  }

  lay_append(...args) {
    const eobj = args.pop();
    const key = args.pop();
    const path = args.concat(); // copy

    let sobj;
    if (path.length === 1 && !(path[0] instanceof Val)) {
      sobj = path[0];
    } else {
      let so = this;
      for (const key of path) {
        so = this.lay_fetch(so, key) || this.lay_create(so, key);
      }
      sobj = so;
    }

    if (eobj instanceof Object) {
      for (const key of Object.keys(eobj)) {
        this.lay_append(eobj, key, eobj[key]);
      }
    }

    const smap = this.lay_logs.get(sobj) || new Map();
    smap.set(this.lay_keystr(key), eobj);
    this.lay_logs.set(sobj, smap);
  }

  lay_fetch(sobj, key) {
    const smap = this.lay_logs.get(sobj);
    return smap ? smap.get(this.lay_keystr(key)) : undefined;
  }

  lay_create(sobj, key) {
    const created = {};
    this.lay_append(sobj, key, created);
    return created;
  }

  lay_exist(key) {
    return this.lay_create(this, key);
  }

  lay_put(object) {
    for (const key of Object.keys(object)) {
      const v = object[key];
      this.lay_append(this, key, v);
    }
  }

  lay_traverse(...args) {
    const traverse = (receiver, ...keys) => {
      for (const key of keys) {
        receiver = this.lay_fetch(receiver, key);
      }
      return receiver;
    };

    if (args[0] instanceof UUID || typeof(args[0]) === "string") {
      // complete this book as receiver
      return traverse(this, ...args);
    } else {
      return traverse(...args);
    }
  }
}
