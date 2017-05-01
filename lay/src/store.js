export default class Store {
  constructor() {
    this.links = {};
  }
  
  append(link) {
    this.links[link.id] = link;
  }
  
  get(id) {
    return this.links[id];
  }
}