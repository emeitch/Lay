import assert from 'assert';

import UUID from '../src/uuid';
import Store from '../src/store';
import Obj from '../src/obj';
import { transaction, transactionTime } from '../src/ontology';

describe("Store", () => {
  const id = new UUID();
  const rel = new UUID();
  const val = new UUID();
  
  let store;
  beforeEach(() => {
    store = new Store();
  });
    
  describe("#add", () => {
    context("standard arguments", () => {
      let log;
      beforeEach(() => {
        log = store.log(id, rel, val);
      });
      
      it("should add a log", () => {
        assert(log.id == id);
        assert(log.rel == rel);
        assert(log.val == val);
        assert(log.in == undefined);
        assert(log.hash.match(/^urn:sha256:.*$/));
        assert(store.get(log.hash) == log);
      });
      
      it("should append a transaction data", () => {
        const tlogs = store.transactionLogs(log);
        assert(tlogs.length == 1);
        
        const t = store.transaction(log);
        assert(t.get(transactionTime).constructor == Date);
      });
    });
    
    context("with location", () => {
      const location = new UUID();

      let log;
      beforeEach(() => {
        log = store.log(id, rel, val, location);
      });

      it("shold add a log with location", () => {
        assert(log.id == id);
        assert(log.rel == rel);
        assert(log.val == val);
        assert(log.in == location);
        assert(store.get(log.hash) == log);
      });
    });
  });
  
  describe("#ref", () => {
    context("key assigned", () => {
      beforeEach(() => {
        store.assign("o", id);
        store.assign("r", rel);
        store.assign("v", val);
      });
      
      it("should return a id by key", () => {
        assert(store.ref("o") == id);
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
  
  describe("#obj", () => {
    beforeEach(() => {
      store.log(id, rel, val);
    });
    
    it("should return a object", () => {
      const o = store.obj(id);
      assert(o.constructor == Obj);
    });
  });
});
