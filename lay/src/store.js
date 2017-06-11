import UUID from './uuid';
import Log from './log';
import Obj from './obj';
import { nameKey, transaction, transactionTime } from './ontology';

export default class Store {
  constructor() {
    this.logs = {};
  }
  
  getLog(logid) {
    return this.logs[logid];
  }
  
  addLog(log) {
    this.logs[log.logid] = log;
  }
  
  where(cond) {
    const results = [];
    
    // todo: 線形探索になっているので高速化する
    for (const logid in this.logs) {
      if (this.logs.hasOwnProperty(logid)) {
        const log = this.logs[logid];
        
        const keys = Object.keys(cond);
        if (keys.every((k) => JSON.stringify(log[k]) == JSON.stringify(cond[k]))) {
          results.push(log);
        }
      }
    }
    
    return results;
  }
  
  obj(id) {
    return new Obj(this, id);
  }
  
  transactionLogs(log) {
    return this.where({id: log.logid, key: transaction});
  }
  
  transaction(log) {
    const tlogs = this.transactionLogs(log);
    if (tlogs.length == 0) {
      return undefined;
    }
    
    const tlog = tlogs[tlogs.length-1];
    const tid = tlog.val;
    return this.obj(tid);
  }
  
  ref(name) {
    const logs = this.where({key: nameKey, val: name});
    const log = logs[logs.length-1];
    return log ? log.id : undefined;
  }
  
  assign(name, id) {
    // todo: ユニーク制約をかけたい
    const log = new Log(id, nameKey, name);
    this.addLog(log);
  }
  
  doTransaction(block) {
    // todo: アトミックな操作に修正する
    const tid = new UUID();
    const log = new Log(tid, transactionTime, new Date());
    this.addLog(log);
    return block(tid);
  }
  
  logWithTransaction(id, key, val, in_, tid) {
    const log = new Log(id, key, val, in_);
    this.addLog(log);
    const tlog = new Log(log.logid, transaction, tid);
    this.addLog(tlog);
    return log;
  }
  
  log(...attrs) {
    const count = 4 - attrs.length;
    for (let i = 0; i < count; i++) {
      attrs.push(undefined);      
    }
    return this.doTransaction(tid => {
      const args = attrs.concat([tid]);
      return this.logWithTransaction(...args);
    });
  }
}
