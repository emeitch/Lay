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
        "set",
        func("key", "val", new LiftedNative(function(key, val) {
          return this.putAct(this.get("self"), key, val);
        }))
      );

      stdbook.put(
        obj,
        "all",
        func("n", new LiftedNative(function(_n) {
          return v(this.taggedIds(this.get("self")));
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

  findLogs(cond) {
    const logs = this.parent ? this.parent.findLogs(cond) : [];

    // todo: 線形探索になっているので高速化する
    for (const [, log] of this.logs) {
      const keys = Object.keys(cond);
      if (keys.every((k) => JSON.stringify(log[k]) === JSON.stringify(cond[k]))) {
        logs.push(log);
      }
    }

    return logs;
  }

  cacheIndex(id, key) {
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
    const obj = this.obj(new UUID());
    obj.set("exists");

    if (props) {
      for (const key of Object.keys(props)) {
        const val = props[key];
        obj.set(key, val);
      }
    }

    return obj;
  }

  objs() {
    const logs = this.findLogs({key: v("exists")});
    const ids = _.uniq(logs.map(l => l.id));
    return ids.map(id => new Obj(this, id));
  }

  transactionObj(log) {
    const tlogs = this.findLogs({id: log.logid, key: transaction});

    if (tlogs.length === 0) {
      return null;
    }

    const tlog = tlogs[0];
    const tid = tlog.val;
    return this.obj(tid);
  }

  get(name) {
    const logs = this.findLogs({id: v(name), key: assign});
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
    const logs = this.findActiveLogs({key: v("tag"), val: sname});
    return logs.map(log => log.id);
  }

  taggedObjs(id) {
    return this.taggedIds(id).map(i => this.obj(i));
  }
}

export class Env extends Book {
  putAct(...args) {
    return this.parent.putAct(...args);
  }
}
