import assert from 'assert';

import { v } from '../src/val';
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
        assert(obj.get(key) === undefined);
      });
    });

    context("with a log has UUID typed val", () => {
      const dst = new UUID();

      beforeEach(() => {
        store.log(id, key, dst);
      });

      it("should return a obj of log's val", () => {
        assert.deepStrictEqual(obj.get(key), store.obj(dst));
      });
    });

    context("with a log has Val typed val", () => {
      beforeEach(() => {
        store.log(id, key, v("value"));
      });

      it("should return a value", () => {
        assert.deepStrictEqual(obj.get(key), v("value"));
      });
    });

    context("with the same key but different val logs", () => {
      beforeEach(() => {
        store.log(id, key, v("val0"));
        store.log(id, key, v("val1"));
      });

      it("should return the last val", () => {
        assert.deepStrictEqual(obj.get(key), v("val1"));
      });
    });

    context("with a invalidated log", () => {
      beforeEach(() => {
        const log = store.log(id, key, v("val0"));
        store.log(log.logid, invalidate);
      });

      it("should return undefined", () => {
        assert.deepStrictEqual(obj.get(key), undefined);
      });

      context("add another log", () => {
        beforeEach(() => {
          store.log(id, key, v("val1"));
        });

        it("should return the val", () => {
          assert.deepStrictEqual(obj.get(key), v("val1"));
        });
      });

      context("add a log which same args for the invalidated log", () => {
        beforeEach(() => {
          store.log(id, key, v("val0"));
        });

        it("should return the val", () => {
          assert.deepStrictEqual(obj.get(key), v("val0"));
        });
      });
    });
  });
});
