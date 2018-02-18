import _ from 'lodash';
import Val from './val';
import v from './v';
import ID from './id';
import UUID from './uuid';
import Log from './log';
import Obj from './obj';
import Comp from './comp';
import Act from './act';
import { sym } from './sym';
import { exp } from './exp';
import { func, LiftedNative } from './func';
import { assign, transaction, transactionTime, invalidate } from './ontology';

export default class Book {
  static createStandardBook() {
    const stdbook = new Book(null);

    {
      const putf = (id, key, val) => stdbook.putAct(id, key, val);
      stdbook.set("put", func("id", "key", "val", new LiftedNative(putf)));
    }

    {
      const obj = new UUID();
      stdbook.set("Object", obj);

      stdbook.put(
        obj,
        sym("set"),
        func("key", "val", new LiftedNative(function(key, val) {
          return this.putAct(this.get("self"), key, val);
        }))
      );

      // todo: allはClassオブジェクト用のメソッドにしたい
      stdbook.put(
        obj,
        sym("all"),
        func(new LiftedNative(function() {
          return v(this.taggedIds(this.get("self")));
        }))
      );

      // todo: thenはActオブジェクト用のメソッドにしたい
      stdbook.set(
        "then",
        func("act1", "act2", new LiftedNative(function(act1, act2) {
          const act = act1.then(act2);
          return act;
        }))
      );
    }

    {
      const arr = new UUID();
      stdbook.set("Array", arr);

      stdbook.put(
        arr,
        sym("map"),
        func("fnc", new LiftedNative(function(fnc) {
          const arr = this.get("self");
          const narr = arr.origin.map(o => {
            const e = exp(fnc, v(o));
            return e.reduce(this);
          });
          return v(narr);
        }))
      );
    }

    {
      const map = new UUID();
      stdbook.set("Map", map);

      stdbook.put(
        map,
        sym("get"),
        func("key", new LiftedNative(function(key) {
          return this.get("self").get(key, this);
        }))
      );
    }

    {
      const cnsl = new UUID();
      stdbook.set("Console", cnsl);

      stdbook.put(
        cnsl,
        sym("puts"),
        func("val", new LiftedNative(function(val) {
          return new Act(() => {
            console.log(val.origin);
          });
        }))
      );
    }

    return stdbook;
  }

  constructor(parent=Book.createStandardBook()) {
    this.parent = parent;
    this.logs = new Map();
    this.activeLogsCache = new Map();
    this.invalidationLogsCache = new Map();
  }

  log(logid) {
    return this.logs.get(logid);
  }

  findLogs(condition) {
    const cond = {};
    Object.keys(condition).forEach(k => {
      if (typeof(condition[k]) === "string") {
        cond[k] = sym(condition[k]);
      } else {
        cond[k] = condition[k];
      }
    });

    const logs = this.parent ? this.parent.findLogs(cond) : [];

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
    key = typeof(key) === "string" ? sym(key) : v(key);
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
      if (a.at === null) {
        return -1;
      } else if (b.at === null) {
        return 1;
      } else {
        return a.at.getTime() - b.at.getTime();
      }
    });

    if (actives.length > 0) {
      return actives;
    }

    if (this.parent) {
      return this.parent.activeLogs(id, key, at);
    }

    return [];
  }

  activeLog(id, key, at=new Date()) {
    const actives = this.activeLogs(id, key, at);
    return actives[actives.length-1];
  }

  findLogWithTags(id, key) {
    const log = this.activeLog(id, key);
    if (log) {
      return log;
    }

    const tlogs = this.activeLogs(id, "tag");
    for (const tlog of tlogs) {
      const env = new Env(this);
      env.set("self", id);

      const p = tlog.val.reduce(env);
      const l = this.findLogWithTags(p, key);
      if (l) {
        return l;
      }
    }

    return this.activeLog(this.get("Object"), key);
  }

  obj(id) {
    if (id instanceof ID || id instanceof Comp) {
      return new Obj(this, id);
    } else if (typeof(id) === "string") {
      return this.obj(this.get(id));
    } else {
      return id;
    }
  }

  new(props) {
    const id = new UUID();
    this.put(id, "exists");

    if (props) {
      for (const key of Object.keys(props)) {
        const val = props[key];
        this.put(id, key, val);
      }
    }

    return id;
  }

  existsIDs() {
    const logs = this.findLogs({key: sym("exists")});
    const ids = _.uniq(logs.map(l => l.id));
    return ids;
  }

  transactionID(log) {
    const tlogs = this.findLogs({id: log.logid, key: transaction});

    if (tlogs.length === 0) {
      return null;
    }

    const tlog = tlogs[0];
    const tid = tlog.val;
    return tid;
  }

  get(name) {
    const logs = this.findLogs({id: sym(name), key: assign});
    const log = logs[logs.length-1];
    if (log) {
      return log.val;
    }

    if (this.parent) {
      return this.parent.get(name);
    }

    return undefined;
  }

  set(name, id) {
    // todo: ユニーク制約をかけたい
    const log = new Log(sym(name), assign, id);
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

  putLog(log) {
    return this.doTransaction(putWithTransaction => {
      return putWithTransaction(log);
    });
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

  taggedIds(id) {
    const name = this.name(id);
    if (name.origin === null) {
      return [];
    }
    const sname = sym(name.origin);
    const logs = this.findActiveLogs({key: "tag", val: sname});
    return logs.map(log => log.id);
  }

  run(acts) {
    if (acts instanceof Obj) {
      acts = acts.id;
    }

    if (acts instanceof Act) {
      acts = v([acts]);
    }

    if (acts instanceof Comp && Array.isArray(acts.origin)) {
      for (let act of acts.origin) {
        do {
          act = act.proceed();
        } while(act.next);
      }
    }
  }
}

export class Env extends Book {
  putAct(...args) {
    return this.parent.putAct(...args);
  }
}
