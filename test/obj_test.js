import assert from 'assert';

import UUID from '../src/uuid';
import Store from '../src/store';
import { invalidate } from '../src/ontology';

describe("Obj", () => {
  const id = new UUID();
  const key = new UUID();

  let store;
  let obj;
  beforeEach(() => {
    store = new Store();
    obj = store.obj(id);
  });

  describe("#get", () => {
    context("without logs", () => {
      it("should return undefined", () => {
        assert.deepStrictEqual(obj.get(key), undefined);
      });
    });

    context("with UUID val log", () => {
      const dst = new UUID();

      beforeEach(() => {
        store.log(id, key, dst);
      });

      it("should return a obj of log's val", () => {
        assert.deepStrictEqual(obj.get(key), store.obj(dst));
      });
    });

    context("with value val log", () => {
      beforeEach(() => {
        store.log(id, key, "value");
      });

      it("should return a value", () => {
        assert.deepStrictEqual(obj.get(key), "value");
      });
    });

    context("with the same key but different val logs", () => {
      beforeEach(() => {
        store.log(id, key, "val0");
        store.log(id, key, "val1");
      });

      it("should return the last val", () => {
        assert.deepStrictEqual(obj.get(key), "val1");
      });
    });

    context("with a invalidated log", () => {
      beforeEach(() => {
        const log = store.log(id, key, "val0");
        store.log(log.logid, invalidate);
      });

      it("should return undefined", () => {
        assert.deepStrictEqual(obj.get(key), undefined);
      });

      context("add other positive log", () => {
        beforeEach(() => {
          store.log(id, key, "val1");
        });

        it("should return the val", () => {
          assert.deepStrictEqual(obj.get(key), "val1");
        });
      });

      context("add same old positive log", () => {
        beforeEach(() => {
          store.log(id, key, "val0");
        });

        it("should return the val", () => {
          assert.deepStrictEqual(obj.get(key), "val0");
        });
      });
    });
  });
});
