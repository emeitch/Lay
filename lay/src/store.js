import UUID from './uuid';
import Link from './link';

export default class Store {
  constructor() {
    this.links = {};
    this.transactionTimeLink = new UUID();
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
  
  addLink(type, from, to, tran) {
    const link = new Link(type, from, to, tran);
    this.append(link);
    return link;
  }
  
  addTransaction() {
    const tran = new UUID();
    this.addLink(this.transactionTimeLink, tran, new Date(), tran);
    return tran;
  }
  
  add(type, from, to) {
    // todo: アトミックな操作に修正する
    const tran = this.addTransaction();
    return this.addLink(type, from, to, tran);
  }
}