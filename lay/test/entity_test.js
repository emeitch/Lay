import assert from 'assert';

import UUID from '../src/uuid';
import Store from '../src/store';
import Entity from '../src/entity';
import { invalidate } from '../src/ontology';

describe("Entity", () => {
  const oid = new UUID();
  const rel = new UUID();

  let store;
  let entity;
  beforeEach(() => {
    store = new Store();
    entity = store.entity(oid);
  });

  describe("#get", () => {
    context("without logs", () => {
      it("should return undefined", () => {
        assert.deepStrictEqual(entity.get(rel), undefined);
      });
    });

    context("with UUID val log", () => {
      const dst = new UUID();

      beforeEach(() => {
        store.log(oid, rel, dst);
      });
      
      it("should return a entity of log's val", () => {
        assert.deepStrictEqual(entity.get(rel), store.entity(dst));
      });
    });
    
    context("with value val log", () => {
      beforeEach(() => {
        store.log(oid, rel, "value");
      });
      
      it("should return a value", () => {
        assert.deepStrictEqual(entity.get(rel), "value");
      });
    });
    
    context("with the same rel but different vals log", () => {
      beforeEach(() => {
        store.log(oid, rel, "ver1");
        store.log(oid, rel, "ver2");
      });
      
      it("should return the last val as updating the property", () => {
        assert.deepStrictEqual(entity.get(rel), "ver2");
      });
    });
    
    context("with invalidated log", () => {
      beforeEach(() => {
        const log = store.log(oid, rel, "value1");
        store.log(log.hash, invalidate);
      });

      it("should return undefined", () => {
        assert.deepStrictEqual(entity.get(rel), undefined);
      });
      
      context("add other positive log", () => {
        beforeEach(() => {
          store.log(oid, rel, "value2");
        });
        
        it("should return the val", () => {
          assert.deepStrictEqual(entity.get(rel), "value2");
        });
      });
      
      context("add same positive log", () => {
        beforeEach(() => {
          store.log(oid, rel, "value1");
        });
        
        it("should return the val", () => {
          assert.deepStrictEqual(entity.get(rel), "value1");
        });
      });
    });
  });
});
