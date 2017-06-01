import assert from 'assert';

import UUID from '../src/uuid';
import Store from '../src/store';
import Entity from '../src/entity';
import { invalid } from '../src/ontology';

describe("Entity", () => {
  const subj = new UUID();
  const rel = new UUID();
  const obj = new UUID();

  let store;
  let entity;
  beforeEach(() => {
    store = new Store();
    entity = store.entity(subj);
  });

  describe("#get", () => {
    context("without propositions", () => {
      it("should return undefined", () => {
        assert.deepStrictEqual(entity.get(rel), undefined);
      });
    });

    context("with UUID object proposition", () => {
      beforeEach(() => {
        store.add(subj, rel, obj);
      });
      
      it("should return a entity of proposition's object", () => {
        assert.deepStrictEqual(entity.get(rel), store.entity(obj));
      });
    });
    
    context("with value object proposition", () => {
      beforeEach(() => {
        store.add(subj, rel, "value");
      });
      
      it("should return a value", () => {
        assert.deepStrictEqual(entity.get(rel), "value");
      });
    });
    
    context("with the same relation but different objects proposition", () => {
      beforeEach(() => {
        store.add(subj, rel, "ver1");
        store.add(subj, rel, "ver2");
      });
      
      it("should return the last object as updating the property", () => {
        assert.deepStrictEqual(entity.get(rel), "ver2");
      });
    });
    
    context("with negative proposition", () => {
      beforeEach(() => {
        const p = store.add(subj, rel, "value1");
        store.add(p.id, invalid);
      });

      it("should return undefined", () => {
        assert.deepStrictEqual(entity.get(rel), undefined);
      });
      
      context("add other positive proposition", () => {
        beforeEach(() => {
          store.add(subj, rel, "value2");
        });
        
        it("should return the object", () => {
          assert.deepStrictEqual(entity.get(rel), "value2");
        });
      });
      
      context("add same positive proposition", () => {
        beforeEach(() => {
          store.add(subj, rel, "value1");
        });
        
        it("should return the object", () => {
          assert.deepStrictEqual(entity.get(rel), "value1");
        });
      });
    });
  });
});
