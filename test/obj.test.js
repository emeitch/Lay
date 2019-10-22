import assert from 'assert';

import Store from '../src/store';
import { uuid } from '../src/uuid';
import { exp } from '../src/exp';
import { plus } from '../src/func';
import { path } from '../src/path';
import v from '../src/v';

describe("Obj", () => {
  context("complex value", () => {
    describe("#jsObj", () => {
      it("should return a js object", () => {
        const c = v({a: "e", b: v([1, v({c: 2}), 3])});
        assert.deepStrictEqual(c.jsObj, {a: "e", b: [1, {c: 2}, 3]});
      });
    });

    describe("#protoName", () => {
      it("should return the proto name string", () => {
        assert.deepStrictEqual(v({a: 1, b: 2}).protoName, "Obj");
      });
    });

    describe("#object", () => {
      it("should return js object", () => {
        const store = new Store();

        assert.deepStrictEqual(v({a: 1, b: 2}).object(store), {
          _proto: "Obj",
          a: 1,
          b: 2
        });

        assert.deepStrictEqual(v("Foo", {a: 1, b: 2}).object(store), {
          _proto: "Foo",
          a: 1,
          b: 2
        });

        assert.deepStrictEqual(v({foo: 1, bar: {buz: "2"}}).object(store), {
          _proto: "Obj",
          foo: 1,
          bar: {
            buz: "2"
          }
        });

        const id = uuid("foo-bar-buz");
        assert.deepStrictEqual(v({foo: path(id), bar: ["2", false, null]}).object(store), {
          _proto: "Obj",
          foo: {
            _proto: "Path",
            origin: [
              ["urn:uuid:foo-bar-buz"]
            ]
          },
          bar: [
            "2",
            false,
            null
          ]
        });

        assert.deepStrictEqual(v({
          _id: id,
          _proto: "Foo",
          foo: v(1)
        }).object(store), {
          _id: "urn:uuid:foo-bar-buz",
          _proto: "Foo",
          foo: 1,
        });
      });
    });

    describe("#get", () => {
      it("should return arg index val", () => {
        const val = v({a: 1, b: 2});
        assert.deepStrictEqual(val.get("a"), v(1));
        assert.deepStrictEqual(val.get(v("a")), v(1));
      });

      context("not exist prop", () => {
        it("should return undefined", () => {
          const val = v({a: 1, b: 2});
          assert.deepStrictEqual(val.get("c"), undefined);
        });
      });
    });

    describe("patch", () => {
      it("should merge diff object", () => {
        const val1 = v({a: 1, b: 2});
        const val2 = val1.patch({c: 3});

        assert.deepStrictEqual(val2.get("a"), v(1));
        assert.deepStrictEqual(val2.get("b"), v(2));
        assert.deepStrictEqual(val2.get("c"), v(3));
      });

      context("patch child properties to null", () => {
        it("should patch the partial diff", () => {
          const val1 = v({
            foo: {
              bar: 2,
              buz: 4,
              fiz: 6,
              dos: {
                a: 1,
                b: 2,
                c: 3
              }
            }
          });
          assert.deepStrictEqual(val1.get("foo").get("bar"), v(2));
          assert.deepStrictEqual(val1.get("foo").get("buz"), v(4));
          assert.deepStrictEqual(val1.get("foo").get("fiz"), v(6));
          assert.deepStrictEqual(val1.get("foo").get("dos").get("a"), v(1));
          assert.deepStrictEqual(val1.get("foo").get("dos").get("b"), v(2));
          assert.deepStrictEqual(val1.get("foo").get("dos").get("c"), v(3));

          const val2 = val1.patch({
            foo: {
              buz: null,
              fiz: v(null),
              dos: {
                a: v(8),
                c: null
              }
            }
          });
          assert.deepStrictEqual(val2.get("foo").get("bar"), v(2));
          assert.deepStrictEqual(val2.get("foo").get("buz"), undefined);
          assert.deepStrictEqual(val2.get("foo").get("fiz"), undefined);
          assert.deepStrictEqual(val1.get("foo").get("dos").get("a"), v(8));
          assert.deepStrictEqual(val1.get("foo").get("dos").get("b"), v(2));
          assert.deepStrictEqual(val1.get("foo").get("dos").get("c"), undefined);
        });
      });
    });

    describe("#reduce", () => {
      it("should return self value", () => {
        const store = new Store();

        const val = v({a: 1, b: 2});
        assert.deepStrictEqual(val.reduce(store), v({a: 1, b: 2}));
      });

      context("with _body property", () => {
        it("should reduce _body property", () => {
          const store = new Store();

          const val = v({a: 1, b: 2, _body: exp(plus, v(1), v(2))});
          assert.deepStrictEqual(val.reduce(store), v(3));
        });
      });
    });

    describe("#collate", () => {
      context("unmatched other val", () => {
        it("should return null", () => {
          assert.deepStrictEqual(v({a: 1}).collate(v([1])).result, null);
          assert.deepStrictEqual(v("Foo", {a: 1}).collate(v({a: 1})).result, null);
        });
      });
    });
  });

  describe("stringify", () => {
    it("should return string dump", () => {
      assert(v({a: [1, 2], b: "bar"}).stringify() === "{\n  a: [\n    1, \n    2\n  ], \n  b: \"bar\"\n}");

      assert(v({a: [v(1), v(2)], b: v("bar")}).stringify() === "{\n  a: [\n    1, \n    2\n  ], \n  b: \"bar\"\n}");

      assert(v("Foo", {a: [v(1), v(2)], b: v("bar")}).stringify() === "Foo {\n  a: [\n    1, \n    2\n  ], \n  b: \"bar\"\n}");
    });
  });

  describe("#keyString", () => {
    it("should return a key string", () => {
      assert.deepStrictEqual(v({foo: 1}).keyString(), "{\n  foo: 1\n}");
    });

    context("with _id", () => {
      it("should return a key string of id", () => {
        const cm = v({
          _id: "foo"
        });
        assert.deepStrictEqual(cm.keyString(), "foo");
      });
    });
  });

  describe("#clone", () => {
    it("should retrun a copied new obj", () => {
      const o1 = v({foo: 3});
      const o2 = o1.clone();

      assert.deepStrictEqual(o1, o2);
      assert(o1 !== o2); // not same JS Object
    });
  });

  describe("#keys", () => {
    it("shold return key names", () => {
      const obj = v({foo: 1, bar: 2, buz: 3});

      assert.deepStrictEqual(obj.keys, ["foo", "bar", "buz"]);
    });
  });

  describe("#equals", () => {
    it("should return the equality", () => {
      const store = new Store();

      const id1 = uuid("id1");
      store.put({
        _id: id1,
        foo: 3,
        bar: 4
      });

      const id2 = uuid("id2");
      store.put({
        _id: id2,
        foo: 3,
        bar: 4
      });

      const id3 = uuid("id3");
      store.put({
        _id: id3,
        foo: 5,
        bar: 6
      });

      const o1 = store.get(id1);
      const o2 = store.get(id2);
      const o3 = store.get(id3);

      assert(o1.equals(o2));
      assert(!o1.equals(o3));
    });

    context("with _proto", () => {
      it("should return the equality", () => {
        const store = new Store();

        const id1 = uuid("id1");
        store.put({
          _proto: "Foo",
          _id: id1,
          foo: 3,
          bar: 4
        });

        const id2 = uuid("id2");
        store.put({
          _proto: "Foo",
          _id: id2,
          foo: 3,
          bar: 4
        });

        const id3 = uuid("id3");
        store.put({
          _proto: "Baz",
          _id: id3,
          foo: 3,
          bar: 4
        });

        const o1 = store.get(id1);
        const o2 = store.get(id2);
        const o3 = store.get(id3);

        assert(o1.equals(o2));
        assert(!o1.equals(o3));
      });
    });

    context("with _status", () => {
      it("should return the equality", () => {
        const store = new Store();

        const id1 = uuid("id1");
        store.put({
          _id: id1,
          foo: 3,
          bar: 4
        });

        const id2 = uuid("id2");
        store.put({
          _id: id2,
          foo: 3,
          bar: 4
        });

        const id3 = uuid("id3");
        store.put({
          _id: id3,
          _status: v("deleted"),
          foo: 3,
          bar: 4
        });

        const o1 = store.get(id1);
        const o2 = store.get(id2);
        const o3 = store.get(id3);

        assert(o1.equals(o2));
        assert(!o1.equals(o3));
      });
    });
  });
});
