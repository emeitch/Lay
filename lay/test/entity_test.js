import assert from 'assert';

import UUID from '../src/uuid';
import Store from '../src/store';
import Entity from '../src/entity';

describe("Entity", () => {
  const subj = new UUID();

  let store;
  let entity;
  beforeEach(() => {
    store = new Store();
    entity = store.entity(subj);
  });

  describe("#get", () => {
    const rel = new UUID();

    context("without propositions", () => {
      it("should return undefined", () => {
        assert.deepStrictEqual(entity.get(rel), undefined);
      });
    });

    context("with UUID object proposition", () => {
      const obj = new UUID();

      beforeEach(() => {
        store.add(subj, rel, obj);
      });
      
      it("should return a entity of proposition's object", () => {
        assert.deepStrictEqual(entity.get(rel), store.entity(obj));
      });
    });
    
    context("with value object proposition", () => {
      const obj = "value";

      beforeEach(() => {
        store.add(subj, rel, obj);
      });
      
      it("should return a value", () => {
        assert.deepStrictEqual(entity.get(rel), obj);
      });
    });
    
    context("with the same relation but different objects proposition", () => {
      const obj1 = "Ver 1.0";
      const obj2 = "Ver 2.0";
      
      beforeEach(() => {
        store.add(subj, rel, obj1);
        store.add(subj, rel, obj2);
      });
      
      it("should return the last object as updating the property", () => {
        assert.deepStrictEqual(entity.get(rel), obj2);
      });
    });
  });
});
