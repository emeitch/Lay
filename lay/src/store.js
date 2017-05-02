import Link from './link';

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
  
  add(type, from, to) {
    const link = new Link(type, from, to);
    this.append(link);
    return link;
  }
}