import { v } from './val';
import ID from './id';
import UUID from './uuid';
import Log from './log';
import Obj from './obj';
import { assign, transaction, transactionTime, invalidate } from './ontology';

export default class Book {
  constructor(parent=undefined) {
    this.parent = parent;
    this.logs = new Map();
    this.activeLogsCache = new Map();
    this.invalidationLogsCache = new Map();
  }

  log(logid) {
    return this.logs.get(logid);
  }

  findLogs(cond) {
    const logs = [];

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
    return id + "__" + key;
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
      if (a.at === undefined) {
        return -1;
      } else if (b.at === undefined) {
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
    if (id instanceof ID) {
      return new Obj(this, id);
    } else {
      return id;
    }
  }

  transactionObj(log) {
    const tlogs = this.findLogs({id: log.logid, key: transaction});

    if (tlogs.length === 0) {
      return undefined;
    }

    const tlog = tlogs[0];
    const tid = tlog.val;
    return this.obj(tid);
  }

  resolve(name) {
    const logs = this.findLogs({id: v(name), key: assign});
    const log = logs[logs.length-1];
    if (log) {
      return log.val;
    }

    if (this.parent) {
      return this.parent.resolve(name);
    }

    return undefined;
  }

  assign(name, id) {
    // todo: ユニーク制約をかけたい
    const log = new Log(v(name), assign, id);
    this.put(log);
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

  put(log) {
    return this.doTransaction(putWithTransaction => {
      return putWithTransaction(log);
    });
  }
}
