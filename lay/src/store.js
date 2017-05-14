import UUID from './uuid';
import Proposition from './proposition';
import { transactionTimeUUID as transactionTime } from './ontology';

export default class Store {
  constructor() {
    this.propositions = {};
  }
  
  get(id) {
    return this.propositions[id];
  }
  
  set(id, p) {
    this.propositions[id] = p;
  }

  append(p) {
    this.set(p.id, p);
  }
  
  addProposition(subj, rel, obj, tran, holder) {
    const p = new Proposition(subj, rel, obj, tran, holder);
    this.append(p);
    return p;
  }
  
  transaction(block) {
    // todo: アトミックな操作に修正する
    const tran = new UUID();
    this.addProposition(tran, transactionTime, new Date(), tran);
    return block(tran);
  }
  
  add(subj, rel, obj, holder) {
    return this.transaction(tran =>
      this.addProposition(subj, rel, obj, tran, holder)
    );
  }
}