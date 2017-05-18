export default class Entity {
  constructor(store, id) {
    this.store = store;
    this.id = id;
  }
  
  get(rel) {
    const ps = this.store.where({subject: this.id, relation: rel});
    if (ps.length == 0) {
      return undefined;
    }
    
    return this.store.entity(ps[0].object);
  }
}