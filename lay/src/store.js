import UUID from './uuid';
import Proposition from './proposition';
import Entity from './entity';
import { relKey, transaction, transactionTime } from './ontology';

export default class Store {
  constructor() {
    this.propositions = {};
  }
  
  get(id) {
    return this.propositions[id];
  }
  
  set(p) {
    this.propositions[p.id] = p;
  }
  
  where(cond) {
    const results = [];
    
    // todo: 線形探索になっているので高速化する
    for (const id in this.propositions) {
      if (this.propositions.hasOwnProperty(id)) {
        const p = this.propositions[id];
        
        const keys = Object.keys(cond);
        if (keys.every((k) => JSON.stringify(p[k]) == JSON.stringify(cond[k]))) {
          results.push(p);
        }
      }
    }
    
    return results;
  }
  
  entity(id) {
    return new Entity(this, id);
  }
  
  ref(key) {
    const ps = this.where({relation: relKey, object: key});
    const p = ps[ps.length-1];
    return p ? p.subject : undefined;
  }
  
  assign(key, id) {
    // todo: ユニーク制約をかけたい
    const p = new Proposition(id, relKey, key);
    this.set(p);
  }
  
  addProposition(subj, rel, obj, loc, tid) {
    const p = new Proposition(subj, rel, obj, loc);
    this.set(p);
    const t = new Proposition(p.id, transaction, tid);
    this.set(t);
    return p;
  }
  
  transaction(block) {
    // todo: アトミックな操作に修正する
    const tid = new UUID();
    const p = new Proposition(tid, transactionTime, new Date());
    this.set(p);
    return block(tid);
  }
  
  add(...attrs) {
    for (let i = 0; i < 4 - attrs.length; i++) {
      attrs.push(undefined);      
    }
    return this.transaction(tid => {
      const args = attrs.concat([tid]);
      return this.addProposition(...args);
    });
  }
}