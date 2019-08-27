import assert from 'assert';

import Store from '../src/store';
import { uuid } from '../src/uuid';
import { exp } from '../src/exp';
import { plus } from '../src/func';
import { path } from '../src/path';
import v from '../src/v';

describe("Comp", () => {
  context("complex value", () => {
    describe("#jsObj", () => {
      it("should return a js object", () => {
        const c = v({a: "e", b: v([1, v({c: 2}), 3])});
        assert.deepStrictEqual(c.jsObj, {a: "e", b: [1, {c: 2}, 3]});
      });
    });

    describe("#reducible", () => {
      it("should return false", () => {
        assert.deepStrictEqual(v({a: 1, b: 2}).reducible, false);
        assert.deepStrictEqual(v([1, 2, 3]).reducible, false);
      });
    });

    describe("#typeName", () => {
      it("should return type sym", () => {
        assert.deepStrictEqual(v({a: 1, b: 2}).typeName, "Map");
        assert.deepStrictEqual(v([1, 2, 3]).typeName, "Array");
      });
    });

    describe("#object", () => {
      it("should return js object", () => {
        const store = new Store();

        assert.deepStrictEqual(v({a: 1, b: 2}).object(store), {
          _type: "Map",
          a: 1,
          b: 2
        });

        assert.deepStrictEqual(v([1, 2, 3]).object(store), {
          _type: "Array",
          origin: [1, 2, 3]
        });

        assert.deepStrictEqual(v("Foo", {a: 1, b: 2}).object(store), {
          _type: "Foo",
          a: 1,
          b: 2
        });

        assert.deepStrictEqual(v([v(1), v("foo"), v(true), v(null)]).object(store), {
          _type: "Array",
          origin: [
            1,
            "foo",
            true,
            null
          ]
        });

        assert.deepStrictEqual(v({foo: 1, bar: {buz: "2"}}).object(store), {
          _type: "Map",
          foo: 1,
          bar: {
            buz: "2"
          }
        });

        const id = uuid("foo-bar-buz");
        assert.deepStrictEqual(v({foo: path(id), bar: ["2", false, null]}).object(store), {
          _type: "Map",
          foo: {
            _type: "Path",
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
          _type: "Foo",
          foo: v(1)
        }).object(store), {
          _id: "urn:uuid:foo-bar-buz",
          _type: "Foo",
          foo: 1,
        });

        assert.deepStrictEqual(v(["foo", v({bar: 1, buz: false})]).object(store), {
          _type: "Array",
          origin: [
            "foo",
            {
              _type: "Map",
              bar: 1,
              buz: false
            }
          ]
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
        it("should reduce _val property", () => {
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
          assert.deepStrictEqual(v([1]).collate(v({a: 1})).result, null);
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
});

describe("CompDate", () => {
  describe("#typeName", () => {
    it("should return a sym to Date", () => {
      const cd = v(new Date());
      assert.deepStrictEqual(cd.typeName, "Date");
    });
  });

  describe("#object", () => {
    it("should return a sym to Date", () => {
      const date = new Date("2018-01-01T00:00:00z");
      const cd = v(date);

      const store = new Store();
      assert.deepStrictEqual(cd.object(store), {
        origin: "2018-01-01T00:00:00.000Z",
        _type: "Date",
      });
    });
  });
});

describe("CompMap", () => {
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
});
