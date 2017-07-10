import assert from 'assert';

import { v } from '../src/val';
import { self } from '../src/self';
import UUID from '../src/uuid';
import Path from '../src/path';
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

    context("with a log which has a val typed by UUID", () => {
      const dst = new UUID();

      beforeEach(() => {
        store.log(id, key, dst);
      });

      it("should return a obj of log's val", () => {
        assert.deepStrictEqual(obj.get(key), store.obj(dst));
      });
    });

    context("with a log which has a val typed by Val", () => {
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

      context("add a log which has same args for the invalidated log", () => {
        beforeEach(() => {
          store.log(id, key, v("val0"));
        });

        it("should return the val", () => {
          assert.deepStrictEqual(obj.get(key), v("val0"));
        });
      });
    });

    context("with a absolute path", () => {
      beforeEach(() => {
        const id2 = new UUID();
        const id3 = new UUID();
        const key2 = new UUID();
        const key3 = new UUID();
        store.log(id2, key2, id3);
        store.log(id3, key3, v("path end"));
        store.log(id, key, new Path(id2, key2, key3));
      });

      it("should return the val", () => {
        assert.deepStrictEqual(obj.get(key), v("path end"));
      });
    });

    context("with a relative path", () => {
      let val2;
      beforeEach(() => {
        val2 = v("val0");
        const key2 = new UUID();
        store.log(id, key2, val2);
        store.log(id, key, new Path(self, key2));
      });

      it("should return the val", () => {
        assert.deepStrictEqual(obj.get(key), val2);
      });
    });
  });
});
