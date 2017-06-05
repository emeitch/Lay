import UUID from './uuid';
import Log from './log';
import Obj from './obj';
import { relKey, transaction, transactionTime } from './ontology';

export default class Store {
  constructor() {
    this.logs = {};
  }
  
  get(hash) {
    return this.logs[hash];
  }
  
  set(log) {
    this.logs[log.hash] = log;
  }
  
  where(cond) {
    const results = [];
    
    // todo: 線形探索になっているので高速化する
    for (const hash in this.logs) {
      if (this.logs.hasOwnProperty(hash)) {
        const log = this.logs[hash];
        
        const keys = Object.keys(cond);
        if (keys.every((k) => JSON.stringify(log[k]) == JSON.stringify(cond[k]))) {
          results.push(log);
        }
      }
    }
    
    return results;
  }
  
  obj(oid) {
    return new Obj(this, oid);
  }
  
  transactionLogs(log) {
    return this.where({oid: log.hash, rel: transaction});
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
  
  ref(key) {
    const logs = this.where({rel: relKey, val: key});
    const log = logs[logs.length-1];
    return log ? log.oid : undefined;
  }
  
  assign(key, oid) {
    // todo: ユニーク制約をかけたい
    const log = new Log(oid, relKey, key);
    this.set(log);
  }
  
  transactLog(oid, rel, val, in_, tid) {
    const log = new Log(oid, rel, val, in_);
    this.set(log);
    const tlog = new Log(log.hash, transaction, tid);
    this.set(tlog);
    return log;
  }
  
  doTransaction(block) {
    // todo: アトミックな操作に修正する
    const tid = new UUID();
    const log = new Log(tid, transactionTime, new Date());
    this.set(log);
    return block(tid);
  }
  
  log(...attrs) {
    const count = 4 - attrs.length;
    for (let i = 0; i < count; i++) {
      attrs.push(undefined);      
    }
    return this.doTransaction(tid => {
      const args = attrs.concat([tid]);
      return this.transactLog(...args);
    });
  }
}
