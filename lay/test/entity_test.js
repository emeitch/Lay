import assert from 'assert';

import UUID from '../src/uuid';
import Store from '../src/store';
import Entity from '../src/entity';
import { invalidate } from '../src/ontology';

describe("Entity", () => {
  const id = new UUID();
  const rel = new UUID();
  const obj = new UUID();

  let store;
  let entity;
  beforeEach(() => {
    store = new Store();
    entity = store.entity(id);
  });

  describe("#get", () => {
    context("without propositions", () => {
      it("should return undefined", () => {
        assert.deepStrictEqual(entity.get(rel), undefined);
      });
    });

    context("with UUID object proposition", () => {
      beforeEach(() => {
        store.add(id, rel, obj);
      });
      
      it("should return a entity of proposition's object", () => {
        assert.deepStrictEqual(entity.get(rel), store.entity(obj));
      });
    });
    
    context("with value object proposition", () => {
      beforeEach(() => {
        store.add(id, rel, "value");
      });
      
      it("should return a value", () => {
        assert.deepStrictEqual(entity.get(rel), "value");
      });
    });
    
    context("with the same rel but different objects proposition", () => {
      beforeEach(() => {
        store.add(id, rel, "ver1");
        store.add(id, rel, "ver2");
      });
      
      it("should return the last object as updating the property", () => {
        assert.deepStrictEqual(entity.get(rel), "ver2");
      });
    });
    
    context("with negative proposition", () => {
      beforeEach(() => {
        const p = store.add(id, rel, "value1");
        store.add(p.hash, invalidate);
      });

      it("should return undefined", () => {
        assert.deepStrictEqual(entity.get(rel), undefined);
      });
      
      context("add other positive proposition", () => {
        beforeEach(() => {
          store.add(id, rel, "value2");
        });
        
        it("should return the object", () => {
          assert.deepStrictEqual(entity.get(rel), "value2");
        });
      });
      
      context("add same positive proposition", () => {
        beforeEach(() => {
          store.add(id, rel, "value1");
        });
        
        it("should return the object", () => {
          assert.deepStrictEqual(entity.get(rel), "value1");
        });
      });
    });
  });
});
