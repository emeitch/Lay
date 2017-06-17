import UUID from './uuid';

export default class Obj {
  constructor(store, id) {
    this.store = store;
    this.id = id;
  }
  
  get(key) {
    const log = this.store.activeLog(this.id, key);
    if (!log) {
      return undefined;
    }
    
    const val = log.val;
    if (val.constructor === UUID) {
      return this.store.obj(val);  
    } else {
      return val;
    }
  }
}
