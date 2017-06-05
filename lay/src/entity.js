import UUID from './uuid';
import { invalidate, transactionTime } from '../src/ontology';

export default class Entity {
  constructor(store, eid) {
    this.store = store;
    this.eid = eid;
  }
  
  get(rel) {
    const logs = this.store.where({eid: this.eid, rel: rel});
    if (logs.length == 0) {
      return undefined;
    }
    
    const log = logs[logs.length-1];
    const t = this.store.transaction(log);
    
    const ilogs = this.store.where({eid: log.hash, rel: invalidate});
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
      return this.store.entity(logs[0].val);  
    } else {
      return val;
    }
  }
}
