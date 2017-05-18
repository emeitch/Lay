import UUID from './uuid';
import Proposition from './proposition';
import { commit, transactionTime } from './ontology';

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
  
  addProposition(subj, rel, obj, holder, transaction) {
    const p = new Proposition(subj, rel, obj, holder);
    this.set(p);
    const t = new Proposition(transaction, commit, p.id);
    this.set(t);
    return p;
  }
  
  transaction(block) {
    // todo: アトミックな操作に修正する
    const transaction = new UUID();
    const p = new Proposition(transaction, transactionTime, new Date());
    this.set(p);
    return block(transaction);
  }
  
  add(subj, rel, obj, holder) {
    return this.transaction(t => {
      return this.addProposition(subj, rel, obj, holder, t);
    });
  }
}