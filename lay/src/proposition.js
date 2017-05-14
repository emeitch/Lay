import UUID from './uuid'

export default class Proposition {
  constructor(subject, relation, object, transaction, holder, id=new UUID()) {
    this.id = id;
    
    this.subject = subject;
    this.relation = relation;
    this.object = object;
    
    this.transaction = transaction;
    
    this.holder = holder;
  }
}