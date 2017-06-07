import UUID from './uuid';
import { invalidate, transactionTime } from '../src/ontology';

export default class Obj {
  constructor(store, id) {
    this.store = store;
    this.id = id;
  }
  
  get(rel) {
    const logs = this.store.where({id: this.id, rel: rel});
    if (logs.length == 0) {
      return undefined;
    }
    
    const log = logs[logs.length-1];
    const t = this.store.transaction(log);
    
    const ilogs = this.store.where({id: log.hash, rel: invalidate});
    if (ilogs.length > 0) {
      const ilog = ilogs[ilogs.length-1];
      const it = this.store.transaction(ilog);
      if (it.get(transactionTime) > t.get(transactionTime)) {
        // apply invalidation
        return undefined;        
      }
    }
    
    const val = log.val;
    // todo: sha256をIDオブジェクト化したい
    if (val.constructor === UUID || typeof(val) === "string" && val.match(/^urn:sha256:/)) {
      return this.store.obj(logs[0].val);  
    } else {
      return val;
    }
  }
}
