import UUID from './uuid';
import { invalidate, transactionTime } from '../src/ontology';

export default class Entity {
  constructor(store, eid) {
    this.store = store;
    this.eid = eid;
  }
  
  get(rel) {
    const ps = this.store.where({eid: this.eid, rel: rel});
    if (ps.length == 0) {
      return undefined;
    }
    
    const p = ps[ps.length-1];
    const t = this.store.transaction(p);
    
    const nps = this.store.where({eid: p.hash, rel: invalidate});
    if (nps.length > 0) {
      const np = nps[nps.length-1];
      const nt = this.store.transaction(np);
      if (nt.get(transactionTime) > t.get(transactionTime)) {
        // apply proposition invalidation
        return undefined;        
      }
    }
    
    const val = p.val;
    // todo: sha256をIDオブジェクト化したい
    if (val.constructor === UUID || typeof(val) === "string" && val.match(/^urn:sha256:/)) {
      return this.store.entity(ps[0].val);  
    } else {
      return val;
    }
  }
}
