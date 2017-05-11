import UUID from './uuid';
import Link from './link';
import { transactionTimeUUID as transactionTime } from './ontology';

export default class Store {
  constructor() {
    this.links = {};
  }
  
  get(id) {
    return this.links[id];
  }
  
  set(id, link) {
    this.links[id] = link;
  }

  append(link) {
    this.set(link.id, link);
  }
  
  addLink(type, from, to, tid) {
    const link = new Link(type, from, to, tid);
    this.append(link);
    return link;
  }
  
  transaction(block) {
    // todo: アトミックな操作に修正する
    const tid = new UUID();
    this.addLink(transactionTime, tid, new Date(), tid);
    return block(tid);
  }
  
  add(type, from, to) {
    return this.transaction(tid =>
      this.addLink(type, from, to, tid)
    );
  }
}