import assert from 'assert';

import v from '../src/v';
import Path, { path } from '../src/path';
import UUID from '../src/uuid';
import Exp, { exp } from '../src/exp';
import { func, plus, concat } from '../src/func';
import { scope } from '../src/scope';
import Book from '../src/book';
import Store from '../src/store';

describe("Path", () => {
  const id1 = new UUID();
  const id2 = new UUID();
  const id3 = new UUID();

  let p;
  beforeEach(() => {
    p = new Path(id1, id2, id3);
  });

  describe("constructor", () => {
    it("should complete prim string", () => {
      assert.deepStrictEqual(new Path("foo", ["bar", "buz"], "fiz"), new Path("foo", [v("bar"), v("buz")], v("fiz")));
    });
  });

  describe("#receiver", () => {
    it("should return the first id", () => {
      assert.deepStrictEqual(p.receiver, id1);
    });
  });

  describe("#keys", () => {
    it("should return rest ids", () => {
      assert.deepStrictEqual(p.keys, [id2, id3]);
    });
  });

  describe("#reduce", () => {
    let book;
    let store;
    beforeEach(() => {
      book = new Book();
      store = new Store();
    });

    context("absolute path with end of uuid", () => {
      const id = new UUID();
      const key = new UUID();
      const id2 = new UUID();
      const key2 = new UUID();
      const id3 = new UUID();

      let p2;
      beforeEach(() => {
        book.put(id, key, id2);
        book.put(id2, key2, id3);
        p = new Path(id, key, key2);

        store.set(id, v({foo: id2}));
        store.set(id2, v({bar: id3}));
        p2 = new Path(id, "foo", "bar");
      });

      it("should return the val", () => {
        assert.deepStrictEqual(p.reduce(book), id3);
        assert.deepStrictEqual(p2.reduce(store), id3);
      });
    });

    context("assigned sym path with val end", () => {
      const id = new UUID();
      const key = new UUID();
      const val = v("val0");

      beforeEach(() => {
        book.put(id, key, val);
        book.set("a", id);
        p = new Path("a", key);
      });

      it("should return the val", () => {
        assert.deepStrictEqual(p.reduce(book), val);
      });
    });

    context("assigned sym path chain with self", () => {
      const id = new UUID();
      const key = new UUID();
      const id2 = new UUID();
      const key2 = new UUID();
      const key3 = new UUID();
      const key4 = new UUID();
      const refkey = new UUID();
      const refval = v(2);

      let p2;
      let p3;
      let p4;
      beforeEach(() => {
        book.put(id, key, id2);
        book.put(id2, key2, new Path("self", refkey));
        book.put(id2, key3, new Path("self", [key4, new Path("self", refkey)]));
        book.put(id2, key4, func("x", exp(plus, "x", new Path("self", refkey))));

        book.set("a", id);
        p2 = new Path("a", key, key2);
        p3 = new Path(id2, key3);

        book.set("foo", func("x", exp(plus, "x", v(1))));
        p4 = new Path(["foo", v(2)]);
      });

      context("referencing key exists", () => {
        beforeEach(() => {
          book.put(id2, refkey, refval);
        });

        it("should return the val", () => {
          assert.deepStrictEqual(p2.reduce(book), refval);
          assert.deepStrictEqual(p3.reduce(book), v(4));
          assert.deepStrictEqual(p4.reduce(book), v(3));
        });
      });

      context("referencing key don't exists", () => {
        it("should return path with reduced self", () => {
          assert.deepStrictEqual(p2.reduce(book), new Path(id2, refkey));
          assert.deepStrictEqual(p3.reduce(book), exp(plus, new Path(id2, refkey), new Path(id2, refkey)).reduce(book));
        });
      });
    });

    context("complex self referencing", () => {
      const id1 = new UUID();
      const id2 = new UUID();

      beforeEach(() => {
        book.put(id1, "foo", v(1));
        book.put(id1, "bar", path("self", "foo"));

        book.put(id2, "foo", v(2));
        book.put(id2, "bar", path("self", "foo"));
        book.put(id2, "buz", func("x", exp(plus, path(id1, "bar"), "x")));
        book.put(id2, "biz", path("self", ["buz", v(3)]));
      });

      it("should refer correct self", () => {
        assert.deepStrictEqual(path(id2, "biz").reduce(book), v(4));
      });
    });

    context("assigned sym path chain with self exp", () => {
      const id = new UUID();
      const key = new UUID();
      const key2 = new UUID();
      const val2 = v(2);

      beforeEach(() => {
        book.put(id, key, func("x", exp(plus, new Path("self", key2), "x")));
        book.put(id, key2, val2);
        p = new Path(id, [key, v(3)]);
      });

      it("should return the val", () => {
        assert.deepStrictEqual(p.reduce(book), v(5));
      });
    });

    context("access js object property", () => {
      describe("equals", () => {
        it("should return equality", () => {
          const book = new Book();
          const p = path(v(3), ["equals", exp(plus, v(1), v(2))]);
          assert.deepStrictEqual(p.reduce(book), v(true));
        });

        context("partial reduce", () => {
          it("should return a exp", () => {
            const id = new UUID();
            const p = path(v(3), ["equals", path(id, "bar")]);
            assert.deepStrictEqual(p.reduce(book).constructor, Exp);

            book.put(id, "bar", v(3));
            assert.deepStrictEqual(p.reduce(book), v(true));
          });
        });
      });
    });

    context("access a key which type has the key", () => {
      const id = new UUID();

      beforeEach(() => {
        const typeid1 = new UUID();
        const typeid2 = new UUID();
        const typeid3 = new UUID();

        book.set("parent1", typeid1);
        book.set("parent2", typeid2);
        book.set("grandparent", typeid3);

        book.put(id, "type", path("parent1"));
        book.put(id, "type", path("parent2"));
        book.put(typeid2, "type", path("grandparent"));

        book.put(typeid1, "foo", v(1));
        book.put(typeid2, "foo", v(2));
        book.put(typeid2, "bar", v(3));
        book.put(typeid3, "baz", v(4));
      });

      it("should return the type's val", () => {
        const p1 = new Path(id, "foo");
        assert.deepStrictEqual(p1.reduce(book), v(1));

        const p2 = new Path(id, "bar");
        assert.deepStrictEqual(p2.reduce(book), v(3));

        const p3 = new Path(id, "baz");
        assert.deepStrictEqual(p3.reduce(book), v(4));
      });
    });

    context("path referencing type", () => {
      const id = new UUID();

      beforeEach(() => {
        const typeid1 = new UUID();

        book.set("parent1", typeid1);

        book.put(id, "type", path("self", "baz"));
        book.put(id, "baz", path("parent1"));

        book.put(typeid1, "foo", v("bar"));
      });

      it("should return the type's val", () => {
        const p1 = new Path(id, "foo");
        assert.deepStrictEqual(p1.reduce(book), v("bar"));
      });
    });

    context("type by path with args", () => {
      const id = new UUID();

      beforeEach(() => {
        const typeid1 = new UUID();

        book.set("parent1", typeid1);

        book.put(id, "type", path("self", ["baz", path("parent1")]));
        book.put(id, "baz", func("arg", path("arg")));

        book.put(typeid1, "foo", v("bar"));
      });

      it("should return the type's val", () => {
        const p1 = new Path(id, "foo");
        assert.deepStrictEqual(p1.reduce(book), v("bar"));
      });
    });

    context("with type but it dosen't have the key", () => {
      const id = new UUID();

      beforeEach(() => {
        const typeid = new UUID();
        book.put(id, "type", typeid);
      });

      it("should return the path", () => {
        const p = new Path(id, "foo");
        assert.deepStrictEqual(p.reduce(book), p);
      });
    });

    context("with comp val", () => {
      it("should return nested val", () => {
        const c = v({a: {b: {c: "d"}}});

        {
          const p = new Path(c, "a", "b");
          assert.deepStrictEqual(p.reduce(book), v({c: "d"}));
        }

        {
          const p = new Path(c, "a", "b", "c");
          assert.deepStrictEqual(p.reduce(book), v("d"));
        }
      });
    });

    context("path in func", () => {
      it("should replace path args", () => {
        const id = new UUID();
        book.put(id, v("foo"), func("a", exp(concat, v("f"), "a")));
        const e = exp(func("x", new Path(id, [v("foo"), path("x")])), v("bar"));
        assert.deepStrictEqual(e.reduce(book), v("fbar"));
      });
    });

    context("context object", () => {
      it("should return val by specified context object", () => {
        const id = new UUID();

        const holder1 = new UUID();
        const context1 = new UUID();
        book.put(holder1, id, context1);
        book.put(context1, "x", v(1));

        const holder2 = new UUID();
        const context2 = new UUID();
        book.put(holder2, id, context2);
        book.put(context2, "x", v(2));

        assert.deepStrictEqual(path(holder1, id, "x").reduce(book), v(1));
        assert.deepStrictEqual(path(holder2, id, "x").reduce(book), v(2));
      });
    });

    context("unknown path", () => {
      const id = new UUID();
      const unknownKey1 = new UUID();
      const unknownKey2 = new UUID();

      beforeEach(() => {
        p = path(id, unknownKey1, unknownKey2);
      });

      it("should return the path", () => {
        assert.deepStrictEqual(p.reduce(book), p);
      });
    });

    context("with scope", () => {
      it("should return scoped id props", () => {
        const id0 = new UUID();
        const id1 = new UUID();
        const sid = scope(id0, id1);
        book.put(sid, "foo", v(3));

        assert.deepStrictEqual(path(sid, "foo").reduce(book), v(3));
      });
    });
  });

  describe("object", () => {
    it("should return js object dump", () => {
      const id = new UUID("foo");
      const p = path(id, "bar", "buz");
      assert.deepStrictEqual(p.object(), {
        type: {
          origin: "Path"
        },
        origin: [
          {
            type: {
              origin: "UUID"
            },
            origin: "foo"
          },
          "bar",
          "buz"
        ]
      });
    });
  });

  describe("stringify", () => {
    it("should return string dump", () => {
      const p = new Path("self", v("foo"));
      assert(p.stringify() === "Path [\n  self, \n  \"foo\"\n]");
    });
  });
});
