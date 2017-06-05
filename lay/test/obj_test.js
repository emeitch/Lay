import assert from 'assert';

import UUID from '../src/uuid';
import Store from '../src/store';
import Obj from '../src/obj';
import { invalidate } from '../src/ontology';

describe("Obj", () => {
  const oid = new UUID();
  const rel = new UUID();

  let store;
  let obj;
  beforeEach(() => {
    store = new Store();
    obj = store.obj(oid);
  });

  describe("#get", () => {
    context("without logs", () => {
      it("should return undefined", () => {
        assert.deepStrictEqual(obj.get(rel), undefined);
      });
    });

    context("with UUID val log", () => {
      const dst = new UUID();

      beforeEach(() => {
        store.log(oid, rel, dst);
      });
      
      it("should return a obj of log's val", () => {
        assert.deepStrictEqual(obj.get(rel), store.obj(dst));
      });
    });
    
    context("with value val log", () => {
      beforeEach(() => {
        store.log(oid, rel, "value");
      });
      
      it("should return a value", () => {
        assert.deepStrictEqual(obj.get(rel), "value");
      });
    });
    
    context("with the same rel but different vals log", () => {
      beforeEach(() => {
        store.log(oid, rel, "ver1");
        store.log(oid, rel, "ver2");
      });
      
      it("should return the last val as updating the property", () => {
        assert.deepStrictEqual(obj.get(rel), "ver2");
      });
    });
    
    context("with invalidated log", () => {
      beforeEach(() => {
        const log = store.log(oid, rel, "value1");
        store.log(log.hash, invalidate);
      });

      it("should return undefined", () => {
        assert.deepStrictEqual(obj.get(rel), undefined);
      });
      
      context("add other positive log", () => {
        beforeEach(() => {
          store.log(oid, rel, "value2");
        });
        
        it("should return the val", () => {
          assert.deepStrictEqual(obj.get(rel), "value2");
        });
      });
      
      context("add same positive log", () => {
        beforeEach(() => {
          store.log(oid, rel, "value1");
        });
        
        it("should return the val", () => {
          assert.deepStrictEqual(obj.get(rel), "value1");
        });
      });
    });
  });
});
