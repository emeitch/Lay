import UUID from './uuid';
import { invalidate, transactionTime } from '../src/ontology';

export default class Obj {
  constructor(store, id) {
    this.store = store;
    this.id = id;
  }
  
  get(key) {
    const logs = this.store.where({id: this.id, key: key});
    if (logs.length == 0) {
      return undefined;
    }
    
    const log = logs[logs.length-1];
    const t = this.store.transaction(log);
    
    const ilogs = this.store.where({id: log.logid, key: invalidate});
    if (ilogs.length > 0) {
        // apply invalidation
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
