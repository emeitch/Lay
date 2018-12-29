import assert from 'assert';

import UUID from '../src/uuid';
import { path } from '../src/path';
import v from '../src/v';
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

  describe("#put (#get)", () => {
    it("should store the object", () => {
      const id = new UUID();
      const obj = v({
        _id: id,
        foo: 1,
        bar: "abc"
      });
      store.put(obj);

      assert.deepStrictEqual(store.get(id), obj);
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

      assert.deepStrictEqual(store.get("foo"), v({
        _id: "foo",
        a: 1,
        b: "c"
      }));
      assert.deepStrictEqual(store.get("bar"), v({
        _id: "bar",
        _target: 1
      }));
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

        assert.deepStrictEqual(store.get(id), v({
          _id: id,
          a: 1
        }));
      });
    });

    context("an object exists", () => {
      it("should merge the properties", () => {
        store.merge({
          foo: {
            a: 1,
          },
        });

        assert.deepStrictEqual(store.get("foo").reduce(store), v({
          _id: "foo",
          a:1
        }));

        store.merge({
          foo: {
            b: 2,
            c: 3
          },
        });
        assert.deepStrictEqual(store.get("foo").reduce(store), v({
          _id: "foo",
          a:1,
          b:2,
          c:3
        }));
      });
    });
  });

  describe("#getOwnProp", () => {
    context("receiver as a comp", () => {
      it("return a property", () => {
        assert.deepStrictEqual(store.getOwnProp(v({foo: 3}), "foo"), v(3));
      });
    });
  });

  describe("#findPropWithType", () => {
    let id;
    beforeEach(() => {
      store.put({
        _id: "Object",
        foo: 1
      });

      store.put({
        _id: "Bar",
        foo: 2
      });

      store.put({
        _id: "Buz",
        foo: 4,
        foz: 4
      });

      id = new UUID();
    });

    context("self prop", () => {
      it("should return self prop", () => {
        store.put({
          _id: id,
          type: path("Bar"),
          foo: 3
        });

        assert.deepStrictEqual(store.findPropWithType(id, "foo"), v(3));
      });
    });

    context("type prop", () => {
      it("should return type prop", () => {
        store.put({
          _id: id,
          type: path("Bar"),
        });

        assert.deepStrictEqual(store.findPropWithType(id, "foo"), v(2));
      });
    });

    context("multiple type", () => {
      it("should return first type prop", () => {
        store.put({
          _id: id,
          type: [
            path("Bar"),
            path("Buz")
          ]
        });

        assert.deepStrictEqual(store.findPropWithType(id, "foo"), v(2));
        assert.deepStrictEqual(store.findPropWithType(id, "foz"), v(4));
      });
    });

    context("grandparent type", () => {
      it("should return grandparent type prop", () => {
        store.put({
          _id: "Grandtype",
          foo: 5
        });
        store.put({
          _id: "Parenttype",
          type: path("Grandtype")
        });
        const child = new UUID();
        store.put({
          _id: child,
          type: path("Parenttype"),
        });

        assert.deepStrictEqual(store.findPropWithType(child, "foo"), v(5));
      });
    });

    context("access Object prop", () => {
      it("should return Object prop", () => {
        store.put({
          _id: id,
        });
        assert.deepStrictEqual(store.findPropWithType(id, "foo"), v(1));
      });
    });
  });

  describe("handle onPut", () => {
    it("should handle onPut handler", () => {
      let a = 0;
      store.assign("onPut", new Act(pairs => {
        if (pairs[0].val.get("foo").equals(v("bar"))) {
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
      assert.deepStrictEqual(store.get("currentStoreId").reduce(store), store.id);
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
