import assert from 'assert';

import UUID from '../src/uuid';
import Store from '../src/store';
import Entity from '../src/entity';
import { invalidate } from '../src/ontology';

describe("Entity", () => {
  const eid = new UUID();
  const rel = new UUID();

  let store;
  let entity;
  beforeEach(() => {
    store = new Store();
    entity = store.entity(eid);
  });

  describe("#get", () => {
    context("without propositions", () => {
      it("should return undefined", () => {
        assert.deepStrictEqual(entity.get(rel), undefined);
      });
    });

    context("with UUID val proposition", () => {
      const dst = new UUID();

      beforeEach(() => {
        store.add(eid, rel, dst);
      });
      
      it("should return a entity of proposition's val", () => {
        assert.deepStrictEqual(entity.get(rel), store.entity(dst));
      });
    });
    
    context("with value val proposition", () => {
      beforeEach(() => {
        store.add(eid, rel, "value");
      });
      
      it("should return a value", () => {
        assert.deepStrictEqual(entity.get(rel), "value");
      });
    });
    
    context("with the same rel but different vals proposition", () => {
      beforeEach(() => {
        store.add(eid, rel, "ver1");
        store.add(eid, rel, "ver2");
      });
      
      it("should return the last val as updating the property", () => {
        assert.deepStrictEqual(entity.get(rel), "ver2");
      });
    });
    
    context("with invalidated proposition", () => {
      beforeEach(() => {
        const p = store.add(eid, rel, "value1");
        store.add(p.hash, invalidate);
      });

      it("should return undefined", () => {
        assert.deepStrictEqual(entity.get(rel), undefined);
      });
      
      context("add other positive proposition", () => {
        beforeEach(() => {
          store.add(eid, rel, "value2");
        });
        
        it("should return the val", () => {
          assert.deepStrictEqual(entity.get(rel), "value2");
        });
      });
      
      context("add same positive proposition", () => {
        beforeEach(() => {
          store.add(eid, rel, "value1");
        });
        
        it("should return the val", () => {
          assert.deepStrictEqual(entity.get(rel), "value1");
        });
      });
    });
  });
});
