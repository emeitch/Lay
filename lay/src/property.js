import UUID from './uuid'

export default class Property {
  constructor(subject, predicate, object, id=UUID.generate()) {
    this.subject = subject;
    this.predicate = predicate;
    this.object = object;
    this.id = id;
  }
}