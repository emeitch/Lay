import assert from 'assert';

import UUID from '../src/uuid';
import Store from '../src/store';
import Entity from '../src/entity';

describe('Entity', () => {
  let store;
  beforeEach(() => {
    store = new Store();
  })

  describe('#get', () => {
    const subj = new UUID();
    const rel = new UUID();

    context('with UUID object proposition', () => {
      const obj = new UUID();

      let entity;
      beforeEach(() => {
        store.add(subj, rel, obj);
        entity = store.entity(subj);
      });
      
      it("should return a entity of proposition's object", () => {
        assert.deepStrictEqual(entity.get(rel), store.entity(obj));
      });
    });
    
    context('with value object proposition', () => {
      const obj = "value";

      let entity;
      beforeEach(() => {
        store.add(subj, rel, obj);
        entity = store.entity(subj);
      });
      
      it("should return a value", () => {
        assert.deepStrictEqual(entity.get(rel), obj);
      });
    });
    
    context('with the same relation but different objects proposition', () => {
      const obj1 = "Ver 1.0";
      const obj2 = "Ver 2.0";
      
      let entity;
      beforeEach(() => {
        store.add(subj, rel, obj1);
        store.add(subj, rel, obj2);
        entity = store.entity(subj);
      });
      
      it("should return the last object as updating the property", () => {
        assert.deepStrictEqual(entity.get(rel), obj2);
      });
    });
  });
});

