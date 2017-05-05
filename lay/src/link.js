import UUID from './uuid'

export default class Link {
  constructor(type, from, to, transaction, id=new UUID()) {
    this.id = id;
    this.type = type;
    this.from = from;
    this.to = to;
    this.transaction = transaction;
  }
}