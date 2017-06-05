import assert from 'assert';

import UUID from '../src/uuid';
import Store from '../src/store';
import Entity from '../src/entity';
import { transaction, transactionTime } from '../src/ontology';

describe("Store", () => {
  const oid = new UUID();
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
        log = store.log(oid, rel, val);
      });
      
      it("should add a log", () => {
        assert(log.oid == oid);
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
        log = store.log(oid, rel, val, location);
      });

      it("shold add a log with location", () => {
        assert(log.oid == oid);
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
        store.assign("e", oid);
        store.assign("r", rel);
        store.assign("v", val);
      });
      
      it("should return a id by key", () => {
        assert(store.ref("e") == oid);
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
      store.log(oid, rel, val);
    });
    
    it("should return a entity", () => {
      const e = store.entity(oid);
      assert(e.constructor == Entity);
    });
  });
});
