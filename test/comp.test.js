import assert from 'assert';

import Book from '../src/book';
import Hash from '../src/hash';
import { sym } from '../src/sym';
import v from '../src/v';

describe("Comp", () => {
  context("complex value", () => {
    describe("#hash", () => {
      it("should return a hash val", () => {
        assert.deepStrictEqual(v({a: 1, b: 2}).hash, new Hash({a: 1, b: 2}));
        assert.deepStrictEqual(v([1, 2, 3]).hash, new Hash([1, 2, 3]));
      });
    });

    describe("#id", () => {
      it("should return a hash", () => {
        assert.deepStrictEqual(v({a: 1, b: 2}).id, new Hash({a: 1, b: 2}));
        assert.deepStrictEqual(v([1, 2, 3]).id, new Hash([1, 2, 3]));
      });
    });

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
        assert.deepStrictEqual(v({a: 1, b: 2}).type, sym("Map"));
        assert.deepStrictEqual(v([1, 2, 3]).type, sym("Array"));
      });
    });

    describe("#object", () => {
      it("should return js object", () => {
        const book = new Book();

        assert.deepStrictEqual(v({a: 1, b: 2}).object(book), {
          type: {
            origin: "Map"
          },
          origin: {
            a: 1,
            b: 2
          }
        });
        assert.deepStrictEqual(v([1, 2, 3]).object(book), {
          type: {
            origin: "Array"
          },
          origin: [1, 2, 3]
        });


        assert.deepStrictEqual(v("foo", {a: 1, b: 2}).object(book), {
          type: {
            origin: "Map"
          },
          head: "foo",
          origin: {
            a: 1,
            b: 2
          }
        });
        assert.deepStrictEqual(v("bar", [1, 2, 3]).object(book), {
          type: {
            origin: "Array"
          },
          head: "bar",
          origin: [1, 2, 3]
        });
      });
    });

    describe("#merge", () => {
      it("should return merged comp", () => {
        const val = v({a: 1, b: 2});
        assert.deepStrictEqual(val.merge({b: 3, c: 4}), v({a: 1, b: 3, c: 4}));
      });
    });

    describe("#set", () => {
      it("should return updated comp", () => {
        const val = v({a: 1, b: 2});
        assert.deepStrictEqual(val.set("b", v({c: 3, d: 4})), v({a: 1, b: {c: 3, d: 4}}));
      });
    });

    describe("#get", () => {
      it("should return arg index val", () => {
        const val = v({a: 1, b: 2});
        assert.deepStrictEqual(val.get("a"), v(1));
        assert.deepStrictEqual(val.get(v("a")), v(1));
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

  describe("object", () => {
    it("should return JS Object dump", () => {
      assert.deepStrictEqual(v([v(1), v("foo"), v(true), v(null)]).object(), {
        type: {
          origin: "Array"
        },
        origin: [
          1,
          "foo",
          true,
          null
        ]
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
