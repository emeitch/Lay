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
}