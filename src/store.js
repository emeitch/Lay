import UUID from './uuid';
import Log from './log';
import Obj from './obj';
import { nameKey, transaction, transactionTime, invalidate } from './ontology';

export default class Store {
  constructor() {
    this.logs = new Map();
    this.activeLogsCache = new Map();
    this.invalidationLogsCache = new Map();
  }

  getLog(logid) {
    return this.logs.get(logid);
  }

  findLogs(cond) {
    const logs = [];

    // todo: 線形探索になっているので高速化する
    for (const [, log] of this.logs) {
      const keys = Object.keys(cond);
      if (keys.every((k) => JSON.stringify(log[k]) == JSON.stringify(cond[k]))) {
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
    for (let [, ilog] of ilogs) {
      const log = alogs.get(ilog.id);
      if (log && (!ilog.at || ilog.at <= at)) {
          alogs.delete(ilog.id);
      }
    }
    return Array.from(alogs.values()).sort((a, b) => {
      if (a.at == undefined) {
        return -1;
      } else if (b.at == undefined) {
        return 1;
      } else {
        return a.at.getTime() - b.at.getTime();
      }
    });
  }

  activeLog(id, key, at=new Date()) {
    const actives = this.activeLogs(id, key, at);
    return actives[actives.length-1];
  }

  obj(id) {
    return new Obj(this, id);
  }

  transactionObj(log) {
    const tlogs = this.findLogs({id: log.logid, key: transaction});

    if (tlogs.length == 0) {
      return undefined;
    }

    const tlog = tlogs[0];
    const tid = tlog.val;
    return this.obj(tid);
  }

  ref(name) {
    const logs = this.findLogs({key: nameKey, val: name});
    const log = logs[logs.length-1];
    return log ? log.id : undefined;
  }

  assign(name, id) {
    // todo: ユニーク制約をかけたい
    this.log(id, nameKey, name);
  }

  syncCache(log) {
    const i = this.cacheIndex(log.id, log.key);
    const al = this.activeLogsCache.get(i) || new Map();
    al.set(log.logid, log);
    this.activeLogsCache.set(i, al);

    if (log.key == invalidate) {
      const positive = this.getLog(log.id);
      const i = this.cacheIndex(positive.id, positive.key);
      const il = this.invalidationLogsCache.get(i) || new Map();
      il.set(log.logid, log);
      this.invalidationLogsCache.set(i, il);
    }
  }

  doTransaction(block) {
    // todo: アトミックな操作に修正する
    const addLog = (log) => {
      this.logs.set(log.logid, log);
      this.syncCache(log);
    };
    const tid = new UUID();
    const ttlog = new Log(tid, transactionTime, new Date());

    addLog(ttlog);

    const logWithTransaction = (...args) => {
      const log = new Log(...args);
      addLog(log);
      const tlog = new Log(log.logid, transaction, tid);
      addLog(tlog);
      return log;
    };
    return block(logWithTransaction);
  }

  log(...attrs) {
    return this.doTransaction(logWithTransaction => {
      return logWithTransaction(...attrs);
    });
  }
}
