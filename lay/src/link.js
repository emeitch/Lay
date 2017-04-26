import UUID from './uuid'

export default class Link {
  constructor(type, from, to, id=UUID.path()) {
    this.type = type;
    this.from = from;
    this.to = to;
    this.id = id;
  }
}