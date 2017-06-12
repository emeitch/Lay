import UUID from './uuid';
import Log from './log';
import Obj from './obj';
import { nameKey, transaction, transactionTime, invalidate } from './ontology';

export default class Store {
  constructor() {
    this.logs = {};
    this.activeLogsCache = {};
  }
  
  getLog(logid) {
    return this.logs[logid];
  }
    
  findLogs(cond) {
    const logs = [];
    
    // todo: 線形探索になっているので高速化する
    for (const logid in this.logs) {
      if (this.logs.hasOwnProperty(logid)) {
        const log = this.logs[logid];
        
        const keys = Object.keys(cond);
        if (keys.every((k) => JSON.stringify(log[k]) == JSON.stringify(cond[k]))) {
          logs.push(log);
        }
      }
    }
    
    return logs;
  }
  
  activeLogsIterator(id, key) {
    const i = id + "__" + key;
    const al = this.activeLogsCache[i];
    return al ? al.values() : [].entries();
  }
  
  activeLogs(id, key) {
    const itr = this.activeLogsIterator(id, key);
    return Array.from(itr);
  }
  
  activeLog(id, key) {
    const itr = this.activeLogsIterator(id, key);
    
    let log = undefined;
    let ires = itr.next();
    while(!ires.done) {
      log = ires.value;
      ires = itr.next();
    }
    
    return log;
  }
  
  obj(id) {
    return new Obj(this, id);
  }
  
  transactionObj(log) {
    const tlogs = this.findLogs({id: log.logid, key: transaction});
    
    if (tlogs.length > 1) {
      throw "too many transaction logs";
    }
    
    if (tlogs.length == 0) {
      return undefined;
    }
    
    const tlog = tlogs[tlogs.length-1];
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
    const i = log.id + "__" + log.key;
    const al = this.activeLogsCache[i] || new Set();
    al.add(log);
    this.activeLogsCache[i] = al;
    
    if (log.key == invalidate) {
      const positive = this.getLog(log.id);
      const i = positive.id + "__" + positive.key;
      const al = this.activeLogsCache[i];
      al.delete(positive);
    }
  }
  
  doTransaction(block) {
    // todo: アトミックな操作に修正する
    const addLog = (log) => {
      this.logs[log.logid] = log;
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
