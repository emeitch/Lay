import assert from 'assert';

import UUID from '../src/uuid';
import v from '../src/v';
import { path } from '../src/path';
import { sym } from '../src/sym';
import Act from '../src/act';
import Store from '../src/store';


describe("Store", () => {
  let store;
  beforeEach(() => {
    store = new Store();
  });

  describe("constructor", () => {
    it("should create new store object", () => {
      assert(store);
    });
  });

  describe("keyStr", () => {
    it("should return string for key", () => {
      assert(store.keyStr("foo") === "foo");
      assert(store.keyStr(sym("foo")) === "foo");
      assert(store.keyStr(v("foo")) === "foo");
      assert(store.keyStr(v({_id: v("foo")})) === "foo");
      assert(store.keyStr(v({_id: new UUID()})).match(/urn:uuid:.*/));
      assert(store.keyStr(new UUID()).match(/urn:uuid:.*/));
    });
  });

  describe("#put (#get)", () => {
    it("should store the object", () => {
      const id = new UUID();
      const obj = v({
        _id: id,
        foo: 1,
        bar: "abc"
      });
      store.put(obj);

      assert.deepStrictEqual(store.fetch(id).get("foo"), v(1));

      assert.deepStrictEqual(path(id, "_rev", "_type").reduce(store), path("Revision").reduce(store));
      assert.deepStrictEqual(path(id, "_rev", "at", "_type").reduce(store), path("Date").reduce(store));
    });

    context("not sym type", () => {
      it("should throw error", () => {
        assert.throws(() => {
          store.put({
            _id: new UUID(),
            _type: path("Foo") // error type
          });
        }, /bad type reference style:/);
      });
    });

    context("different _rev", () => {
      it("should optimistic lock", () => {
        const id = new UUID();
        store.put({
          _id: id,
          foo: 3
        });
        assert.deepStrictEqual(store.fetch(id).get("foo"), v(3));

        const old = store.fetch(id);

        store.put(old.patch({
          foo: 4
        })); // update _rev
        assert.deepStrictEqual(store.fetch(id).get("foo"), v(4));

        assert.throws(() => {
          store.put(old.patch({
            foo: 5
          }));
        }, /optimistic locked: specified _rev is not latest/);

        assert.throws(() => {
          store.put(old.patch({
            _rev: null,
            foo: 5
          }));
        }, /optimistic locked: _rev is not specified/);
      });
    });

    context("path as id", () => {
      it("should store the object", () => {
        const p = path(new UUID(), new UUID());
        const obj = v({
          _id: p,
          foo: 1,
          bar: "abc"
        });
        store.put(obj);

        assert.deepStrictEqual(store.fetch(p).get("foo"), v(1));
      });
    });

    context("with path whose last key is string", () => {
      it("should store the partial object for new object", () => {
        const id = new UUID();
        const p = path(id, "k1", "k2");
        const obj = v({
          _id: p,
          foo: 1,
          bar: "abc",
        });
        store.put(obj);

        assert.deepStrictEqual(path(id, "k1", "k2", "foo").reduce(store), v(1));
      });

      context("exist obj", () => {
        it("should update the partial object", () => {
          const id = new UUID();
          store.put({
            _id: id,
          });

          const p = path(id, "k1", "k2");
          const obj = v({
            _id: p,
            foo: 1,
            bar: "abc",
          });
          store.put(obj);

          assert.deepStrictEqual(path(id, "k1", "k2", "foo").reduce(store), v(1));
        });
      });
    });
  });

  describe("#patch", () => {
    it("should patch the diff", () => {
      const id = new UUID();
      store.patch(id, {
        foo: 3
      });

      assert.deepStrictEqual(store.fetch(id).getOwnProp("foo"), v(3));
    });

    context("patch child properties", () => {
      it("should patch the partial diff", () => {
        const id = new UUID();
        store.patch(id, {
          foo: {
            bar: 2
          }
        });
        assert.deepStrictEqual(path(id, "foo", "bar").reduce(store), v(2));

        store.patch(id, {
          foo: {
            buz: 4
          }
        });
        assert.deepStrictEqual(path(id, "foo", "bar").reduce(store), v(2)); // keep
        assert.deepStrictEqual(path(id, "foo", "buz").reduce(store), v(4));
      });
    });

    context("patch child properties to null", () => {
      it("should patch the partial diff", () => {
        const id = new UUID();
        store.patch(id, {
          foo: {
            bar: 2,
            buz: 4
          }
        });
        assert.deepStrictEqual(path(id, "foo", "bar").reduce(store), v(2));
        assert.deepStrictEqual(path(id, "foo", "buz").reduce(store), v(4));
        const rev = path(id, "_rev").reduce(store);

        store.patch(id, {
          foo: {
            buz: null
          }
        });
        assert.deepStrictEqual(path(id, "foo", "bar").reduce(store), v(2)); // keep
        const p = path(id, "foo", "buz");
        assert.deepStrictEqual(p.reduce(store), p);
        assert.deepStrictEqual(path(id, "_prev").reduce(store), rev);
      });
    });
  });

  describe("#merge", () => {
    it("should merge the patch", () => {
      store.merge({
        foo: {
          a: 1,
          b: "c"
        },
        bar: 1
      });

      assert.deepStrictEqual(store.fetch("foo").getOwnProp("a"), v(1));
      assert.deepStrictEqual(store.fetch("foo").getOwnProp("b"), v("c"));

      assert.deepStrictEqual(store.fetch("bar").getOwnProp("_target"), v(1));
    });

    context("uuid", () => {
      it("should merge the patch", () => {
        const id = new UUID();
        const patch = {
          [id.stringify()]: {
            a: 1
          }
        };
        store.merge(patch);

        assert.deepStrictEqual(store.fetch(id).getOwnProp("a"), v(1));
      });
    });

    context("an object exists", () => {
      it("should merge the properties", () => {
        store.merge({
          foo: {
            a: 1,
          },
        });

        assert.deepStrictEqual(store.fetch("foo").getOwnProp("a"), v(1));

        store.merge({
          foo: {
            b: 2,
            c: 3
          },
        });
        assert.deepStrictEqual(store.fetch("foo").getOwnProp("a"), v(1));
        assert.deepStrictEqual(store.fetch("foo").getOwnProp("b"), v(2));
        assert.deepStrictEqual(store.fetch("foo").getOwnProp("c"), v(3));
      });
    });
  });

  describe("handle onPut", () => {
    it("should handle onPut handler", () => {
      let a = 0;
      store.assign("onPut", new Act(objs => {
        const hasProp = objs.some(o => {
          const foo = o.get("foo", store);
          return foo && foo.equals(v("bar"));
        });
        if (hasProp) {
          a = 1;
        }
      }));

      assert.deepStrictEqual(a, 0);

      store.put({
        _id: new UUID(),
        foo: "bar"
      });

      assert.deepStrictEqual(a, 1);
    });
  });

  describe("handle onImport", () => {
    it("should handle onImport handler", () => {
      const lib = new Store();
      let a = 0;
      lib.assign("onImport", new Act(() => {
        a = 1;
      }));

      assert.deepStrictEqual(a, 0);

      store.import(lib);

      assert.deepStrictEqual(a, 1);
    });
  });

  describe("#currentStoreId", () => {
    it("should return the store ID", () => {
      assert.deepStrictEqual(store.fetch("currentStoreId").reduce(store), store.id);
    });
  });

  describe("#run", () => {
    it("should run act", () => {
      store.run(v(1)); // pass

      let a = 0;
      const act1 = new Act(() => {
        a = 1;
      });

      let b = 0;
      const act2 = new Act(() => {
        b = 2;
      });

      store.run(v([act1, act2]));
      assert.deepStrictEqual(a, 1);
      assert.deepStrictEqual(b, 2);
    });

    context("invalid act", () => {
      it("should throw error", () => {
        assert.throws(() => {
          store.run(v([1]));
        }, /not Act instance:/);
      });
    });
  });
});
