import assert from 'assert';

import UUID from '../src/uuid';
import Store from '../src/store';
import Entity from '../src/entity';
import { transaction, transactionTime } from '../src/ontology';

describe("Store", () => {
  const subj = new UUID();
  const rel = new UUID();
  const obj = new UUID();
  
  let store;
  beforeEach(() => {
    store = new Store();
  });
    
  describe("#add", () => {
    context("standard arguments", () => {
      let p;
      beforeEach(() => {
        p = store.add(subj, rel, obj);
      });
      
      it("should add a proposition", () => {
        assert(p.subject == subj);
        assert(p.relation == rel);
        assert(p.object == obj);
        assert(p.location == undefined);
        assert(p.id.match(/^urn:sha256:.*$/));
        assert(store.get(p.id) == p);
      });
      
      it("should append a transaction data", () => {
        const tps = store.transactionPropositions(p);
        assert(tps.length == 1);
        
        const t = store.transaction(p);
        assert(t.get(transactionTime).constructor == Date);
      });
    });
    
    context("with location", () => {
      const loc = new UUID();

      let p;
      beforeEach(() => {
        p = store.add(subj, rel, obj, loc);
      });

      it("shold add a proposition with location", () => {
        assert(p.subject == subj);
        assert(p.relation == rel);
        assert(p.object == obj);
        assert(p.location == loc);
        assert(store.get(p.id) == p);
      });
    });
  });
  
  describe("#ref", () => {
    context("key assigned", () => {
      beforeEach(() => {
        store.assign("s", subj);
        store.assign("r", rel);
        store.assign("o", obj);
      });
      
      it("should return a id by key", () => {
        assert(store.ref("s") == subj);
        assert(store.ref("r") == rel);
        assert(store.ref("o") == obj);
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
      store.add(subj, rel, obj);
    });
    
    it("should return a entity", () => {
      const e = store.entity(subj);
      assert(e.constructor == Entity);
    });
  });
});
