import assert from 'assert';

import Store from '../src/store';
import UUID from '../src/uuid';
import { sym } from '../src/sym';
import { exp } from '../src/exp';
import { plus } from '../src/func';
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

    describe("#type", () => {
      it("should return type sym", () => {
        assert.deepStrictEqual(v({a: 1, b: 2})._type, sym("Map"));
        assert.deepStrictEqual(v([1, 2, 3])._type, sym("Array"));
      });
    });

    describe("#object", () => {
      it("should return js object", () => {
        const store = new Store();

        assert.deepStrictEqual(v("foo", 1).object(store), {
          _type: {
            origin: "Comp"
          },
          _head: "foo",
          origin: 1
        });

        assert.deepStrictEqual(v("foo", null).object(store), {
          _type: {
            origin: "Comp"
          },
          _head: "foo",
          origin: null
        });

        assert.deepStrictEqual(v({a: 1, b: 2}).object(store), {
          _type: {
            origin: "Map"
          },
          a: 1,
          b: 2
        });

        assert.deepStrictEqual(v([1, 2, 3]).object(store), {
          _type: {
            origin: "Array"
          },
          origin: [1, 2, 3]
        });

        assert.deepStrictEqual(v("foo", {a: 1, b: 2}).object(store), {
          _head: "foo",
          _type: {
            origin: "Map"
          },
          a: 1,
          b: 2
        });

        assert.deepStrictEqual(v("bar", [1, 2, 3]).object(store), {
          _type: {
            origin: "Array"
          },
          _head: "bar",
          origin: [1, 2, 3]
        });

        assert.deepStrictEqual(v([v(1), v("foo"), v(true), v(null)]).object(), {
          _type: {
            origin: "Array"
          },
          origin: [
            1,
            "foo",
            true,
            null
          ]
        });

        assert.deepStrictEqual(v({foo: 1, bar: {buz: "2"}}).object(), {
          _type: {
            origin: "Map"
          },
          foo: 1,
          bar: {
            buz: "2"
          }
        });

        const id = new UUID();
        assert.deepStrictEqual(v({foo: id, bar: ["2", false, null]}).object(), {
          _type: {
            origin: "Map"
          },
          foo: id.object(),
          bar: [
            "2",
            false,
            null
          ]
        });

        assert.deepStrictEqual(v({
          _id: id,
          _type: sym("Foo"),
          foo: v(1)
        }).object(), {
          _id: id.object(),
          _type: {
            origin: "Foo"
          },
          foo: 1,
        });

        assert.deepStrictEqual(v(["foo", v({bar: 1, buz: false})]).object(), {
          _type: {
            origin: "Array"
          },
          origin: [
            "foo",
            {
              _type: {
                origin: "Map"
              },
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

    describe("#reduce", () => {
      it("should return self value", () => {
        const store = new Store();

        const val = v({a: 1, b: 2});
        assert.deepStrictEqual(val.reduce(store), v({a: 1, b: 2}));
      });

      context("with _target property", () => {
        it("should reduce _val property", () => {
          const store = new Store();

          const val = v({a: 1, b: 2, _target: exp(plus, v(1), v(2))});
          assert.deepStrictEqual(val.reduce(store), v(3));
        });
      });
    });

    describe("#field", () => {
      it("should return the field val", () => {
        const val = v("foo", 3);
        assert.deepStrictEqual(val.field, v(3));
      });
    });

    describe("#collate", () => {
      context("unmatched other val", () => {
        it("should return null", () => {
          assert.deepStrictEqual(v({a: 1}).collate(v([1])).result, null);
          assert.deepStrictEqual(v([1]).collate(v({a: 1})).result, null);
          assert.deepStrictEqual(v("Foo", {a: 1}).collate(v({a: 1})).result, null);
          assert.deepStrictEqual(v("Foo", [1]).collate(v([1])).result, null);
        });
      });
    });
  });

  describe("stringify", () => {
    it("should return string dump", () => {
      assert(v({a: [1, 2], b: "bar"}).stringify() === "{\n  a: [\n    1, \n    2\n  ], \n  b: \"bar\"\n}");

      assert(v({a: [v(1), v(2)], b: v("bar")}).stringify() === "{\n  a: [\n    1, \n    2\n  ], \n  b: \"bar\"\n}");

      assert(v("Foo", {a: [v(1), v(2)], b: v("bar")}).stringify() === "\"Foo\" {\n  a: [\n    1, \n    2\n  ], \n  b: \"bar\"\n}");
    });
  });
});

describe("CompDate", () => {
  describe("#type", () => {
    it("should return a sym to Date", () => {
      const cd = v(new Date());
      assert.deepStrictEqual(cd._type, sym("Date"));
    });
  });

  describe("#object", () => {
    it("should return a sym to Date", () => {
      const date = new Date("2018-01-01T00:00:00z");
      const cd = v(date);

      const store = new Store();
      assert.deepStrictEqual(cd.object(store), {
        origin: "2018-01-01T00:00:00.000Z",
        _type: {
          origin: "Date",
        },
      });
    });
  });
});
