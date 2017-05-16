import UUID from './uuid';
import Proposition from './proposition';
import { commitUUID as commit, transactionTimeUUID as transactionTime } from './ontology';

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
  
  addProposition(subj, rel, obj, holder, transaction) {
    const p = new Proposition(subj, rel, obj, holder);
    this.set(p);
    const t = new Proposition(transaction, commit, p);
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