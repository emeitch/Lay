import UUID from './uuid'

export default class Link {
  constructor(type, from, to, place, transaction, id=new UUID()) {
    this.id = id;
    this.type = type;
    this.from = from;
    this.to = to;
    this.in = place;
    this.transaction = transaction;
  }
}