import assert from 'assert';

import UUID from '../src/uuid';
import Store from '../src/store';
import Entity from '../src/entity';
import { transaction, transactionTime } from '../src/ontology';

describe("Store", () => {
  const eid = new UUID();
  const rel = new UUID();
  const val = new UUID();
  
  let store;
  beforeEach(() => {
    store = new Store();
  });
    
  describe("#add", () => {
    context("standard arguments", () => {
      let p;
      beforeEach(() => {
        p = store.add(eid, rel, val);
      });
      
      it("should add a proposition", () => {
        assert(p.eid == eid);
        assert(p.rel == rel);
        assert(p.val == val);
        assert(p.in == undefined);
        assert(p.hash.match(/^urn:sha256:.*$/));
        assert(store.get(p.hash) == p);
      });
      
      it("should append a transaction data", () => {
        const tps = store.transactionPropositions(p);
        assert(tps.length == 1);
        
        const t = store.transaction(p);
        assert(t.get(transactionTime).constructor == Date);
      });
    });
    
    context("with location", () => {
      const location = new UUID();

      let p;
      beforeEach(() => {
        p = store.add(eid, rel, val, location);
      });

      it("shold add a proposition with location", () => {
        assert(p.eid == eid);
        assert(p.rel == rel);
        assert(p.val == val);
        assert(p.in == location);
        assert(store.get(p.hash) == p);
      });
    });
  });
  
  describe("#ref", () => {
    context("key assigned", () => {
      beforeEach(() => {
        store.assign("e", eid);
        store.assign("r", rel);
        store.assign("v", val);
      });
      
      it("should return a id by key", () => {
        assert(store.ref("e") == eid);
        assert(store.ref("r") == rel);
        assert(store.ref("v") == val);
      });

      context("key re-assigned", () => {
        const rel2 = new UUID();

        beforeEach(() => {
          store.assign("r", rel2);
        });
        
        it("should return a re-assigned id by key", () => {
          assert(store.ref("r") == rel2);
        });
      });
    });
  });
  
  describe("#entity", () => {
    beforeEach(() => {
      store.add(eid, rel, val);
    });
    
    it("should return a entity", () => {
      const e = store.entity(eid);
      assert(e.constructor == Entity);
    });
  });
});
