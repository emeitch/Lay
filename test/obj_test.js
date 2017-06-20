import assert from 'assert';

import UUID from '../src/uuid';
import Key from '../src/key';
import Store from '../src/store';
import { invalidate } from '../src/ontology';

describe("Obj", () => {
  const id = new UUID();
  const key = new Key(new UUID(), new UUID(), new UUID());

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

    context("with a log has value typed val", () => {
      beforeEach(() => {
        store.log(id, key, "value");
      });

      it("should return a value", () => {
        assert(obj.get(key) === "value");
      });
    });

    context("with the same key but different val logs", () => {
      beforeEach(() => {
        store.log(id, key, "val0");
        store.log(id, key, "val1");
      });

      it("should return the last val", () => {
        assert(obj.get(key) === "val1");
      });
    });

    context("with a invalidated log", () => {
      beforeEach(() => {
        const log = store.log(id, key, "val0");
        store.log(log.logid, invalidate);
      });

      it("should return undefined", () => {
        assert(obj.get(key) === undefined);
      });

      context("add another log", () => {
        beforeEach(() => {
          store.log(id, key, "val1");
        });

        it("should return the val", () => {
          assert(obj.get(key) === "val1");
        });
      });

      context("add a log which same args for the invalidated log", () => {
        beforeEach(() => {
          store.log(id, key, "val0");
        });

        it("should return the val", () => {
          assert(obj.get(key) === "val0");
        });
      });
    });
  });
});
