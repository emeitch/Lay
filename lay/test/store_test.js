import assert from 'assert';

import UUID from '../src/uuid';
import Store from '../src/store';
import Entity from '../src/entity';
import { transaction, transactionTime } from '../src/ontology';

describe('Store', () => {
  const subj = new UUID();
  const rel = new UUID();
  const obj = new UUID();
  
  let store;
  beforeEach(() => {
    store = new Store();
  })
    
  describe('#add', () => {
    it('should add a proposition', () => {
      const p = store.add(subj, rel, obj);

      assert(p.subject == subj);
      assert(p.relation == rel);
      assert(p.object == obj);
      assert(p.location == undefined);
      assert(p.id.match(/^urn:sha256:.*$/));
      assert(store.get(p.id) == p);
    });
    
    it('should append a transaction data', () => {
      const p = store.add(subj, rel, obj);
      
      const ts = store.where({subject: p.id, relation: transaction});
      assert(ts.length == 1);
      
      const tid = ts[0].object;
      const ttps = store.where({relation: transactionTime, subject: tid});
      assert(ttps.length == 1);
      assert(ttps[0].object.constructor == Date);
    });
    
    describe('with location', () => {
      it('shold add a proposition with location', () => {
        const loc = new UUID();
        const p = store.add(subj, rel, obj, loc);
        
        assert(p.subject == subj);
        assert(p.relation == rel);
        assert(p.object == obj);
        assert(p.location == loc);
        assert(store.get(p.id) == p);
      });
    });
  });
  
  describe('#entity', () => {
    beforeEach(() => {
      store.add(subj, rel, obj);
    });
    
    it('should return a entity', () => {
      const e = store.entity(subj);
      assert(e.constructor == Entity);
    });
  });
});
