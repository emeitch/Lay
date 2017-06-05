import UUID from './uuid';
import Log from './log';
import Entity from './entity';
import { relKey, transaction, transactionTime } from './ontology';

export default class Store {
  constructor() {
    this.logs = {};
  }
  
  get(hash) {
    return this.logs[hash];
  }
  
  set(p) {
    this.logs[p.hash] = p;
  }
  
  where(cond) {
    const results = [];
    
    // todo: 線形探索になっているので高速化する
    for (const hash in this.logs) {
      if (this.logs.hasOwnProperty(hash)) {
        const p = this.logs[hash];
        
        const keys = Object.keys(cond);
        if (keys.every((k) => JSON.stringify(p[k]) == JSON.stringify(cond[k]))) {
          results.push(p);
        }
      }
    }
    
    return results;
  }
  
  entity(eid) {
    return new Entity(this, eid);
  }
  
  transactionLogs(p) {
    return this.where({eid: p.hash, rel: transaction});
  }
  
  transaction(p) {
    const tps = this.transactionLogs(p);
    if (tps.length == 0) {
      return undefined;
    }
    
    const tp = tps[tps.length-1];
    const tid = tp.val;
    return this.entity(tid);
  }
  
  ref(key) {
    const ps = this.where({rel: relKey, val: key});
    const p = ps[ps.length-1];
    return p ? p.eid : undefined;
  }
  
  assign(key, eid) {
    // todo: ユニーク制約をかけたい
    const p = new Log(eid, relKey, key);
    this.set(p);
  }
  
  transactLog(eid, rel, val, in_, tid) {
    const p = new Log(eid, rel, val, in_);
    this.set(p);
    const t = new Log(p.hash, transaction, tid);
    this.set(t);
    return p;
  }
  
  doTransaction(block) {
    // todo: アトミックな操作に修正する
    const tid = new UUID();
    const p = new Log(tid, transactionTime, new Date());
    this.set(p);
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
