import assert from 'assert';

import v from '../src/v';
import Path, { path } from '../src/path';
import UUID from '../src/uuid';
import { sym } from '../src/sym';
import Exp, { exp } from '../src/exp';
import { func, plus, concat } from '../src/func';
import Log from '../src/log';
import Book from '../src/book';

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
      assert.deepStrictEqual(new Path(sym("foo"), ["bar", "buz"], "fiz"), new Path(sym("foo"), [v("bar"), v("buz")], v("fiz")));
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
    beforeEach(() => {
      book = new Book();
    });

    context("absolute path with end of uuid", () => {
      const id = new UUID();
      const key = new UUID();
      const id2 = new UUID();
      const key2 = new UUID();
      const id3 = new UUID();

      beforeEach(() => {
        book.putLog(new Log(id, key, id2));
        book.putLog(new Log(id2, key2, id3));
        p = new Path(id, key, key2);
      });

      it("should return the val", () => {
        assert.deepStrictEqual(p.reduce(book), id3);
      });
    });

    context("assigned sym path with val end", () => {
      const id = new UUID();
      const key = new UUID();
      const val = v("val0");

      beforeEach(() => {
        book.putLog(new Log(id, key, val));
        book.set("a", id);
        p = new Path(sym("a"), key);
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
        book.putLog(new Log(id, key, id2));
        book.putLog(new Log(id2, key2, new Path(sym("self"), refkey)));
        book.putLog(new Log(id2, key3, new Path(sym("self"), [key4, new Path(sym("self"), refkey)])));
        book.putLog(new Log(id2, key4, func("x", exp(plus, "x", new Path(sym("self"), refkey)))));

        book.set("a", id);
        p2 = new Path("a", key, key2);
        p3 = new Path(id2, key3);

        book.set("foo", func("x", exp(plus, "x", v(1))));
        p4 = new Path(["foo", v(2)]);
      });

      context("referencing key exists", () => {
        beforeEach(() => {
          book.putLog(new Log(id2, refkey, refval));
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
        book.put(id1, "bar", path(sym("self"), "foo"));

        book.put(id2, "foo", v(2));
        book.put(id2, "bar", path(sym("self"), "foo"));
        book.put(id2, "buz", func("x", exp(plus, path(id1, "bar"), "x")));
        book.put(id2, "biz", path(sym("self"), ["buz", v(3)]));
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
        book.putLog(new Log(id, key, func("x", exp(plus, new Path(sym("self"), key2), "x"))));
        book.putLog(new Log(id, key2, val2));
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

    context("access a key only its class has the key", () => {
      const id = new UUID();

      beforeEach(() => {
        const classid1 = new UUID();
        const classid2 = new UUID();
        const classid3 = new UUID();

        book.set("parent1", classid1);
        book.set("parent2", classid2);
        book.set("grandparent", classid3);

        book.put(id, "class", sym("parent1"));
        book.put(id, "class", sym("parent2"));
        book.put(classid2, "class", sym("grandparent"));

        book.put(classid1, "foo", v(1));
        book.put(classid2, "foo", v(2));
        book.put(classid2, "bar", v(3));
        book.put(classid3, "baz", v(4));
      });

      it("should return the class's val", () => {
        const p1 = new Path(id, "foo");
        assert.deepStrictEqual(p1.reduce(book), v(1));

        const p2 = new Path(id, "bar");
        assert.deepStrictEqual(p2.reduce(book), v(3));

        const p3 = new Path(id, "baz");
        assert.deepStrictEqual(p3.reduce(book), v(4));
      });
    });

    context("path referencing class", () => {
      const id = new UUID();

      beforeEach(() => {
        const classid1 = new UUID();

        book.set("parent1", classid1);

        book.put(id, "class", path(sym("self"), "baz"));
        book.put(id, "baz", sym("parent1"));

        book.put(classid1, "foo", v("bar"));
      });

      it("should return the class's val", () => {
        const p1 = new Path(id, "foo");
        assert.deepStrictEqual(p1.reduce(book), v("bar"));
      });
    });

    context("class by path with args", () => {
      const id = new UUID();

      beforeEach(() => {
        const classid1 = new UUID();

        book.set("parent1", classid1);

        book.put(id, "class", path(sym("self"), ["baz", sym("parent1")]));
        book.put(id, "baz", func("arg", sym("arg")));

        book.put(classid1, "foo", v("bar"));
      });

      it("should return the class's val", () => {
        const p1 = new Path(id, "foo");
        assert.deepStrictEqual(p1.reduce(book), v("bar"));
      });
    });

    context("with class but it dosen't have the key", () => {
      const id = new UUID();

      beforeEach(() => {
        const classid = new UUID();
        book.put(id, "class", classid);
      });

      it("should return the path", () => {
        const p = new Path(id, sym("foo"));
        assert.deepStrictEqual(p.reduce(book), p);
      });
    });

    context("with comp val", () => {
      it("should return nested val", () => {
        const c = v({a: {b: {c: "d"}}});

        {
          const p = new Path(c, sym("a"), sym("b"));
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
        const e = exp(func("x", new Path(id, [v("foo"), sym("x")])), v("bar"));
        assert.deepStrictEqual(e.reduce(book), v("fbar"));
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

    context("reducible sym key and sym assgin first", () => {
      it("should political reduce", () => {
        const id = new UUID();
        book.put(id, "foo", v(1));
        assert.deepStrictEqual(path(id, "foo").reduce(book), v(1));

        book.set("foo", v("bar"));
        assert.deepStrictEqual(path(id, "foo").reduce(book), v(1));

        book.put(id, "bar", v(2));
        assert.deepStrictEqual(path(id, sym("foo")).reduce(book), v(2));
      });
    });

    context("reducible key and assign last", () => {
      it("should political reduce", () => {
        const id = new UUID();
        book.put(id, "foo", v(1));
        assert.deepStrictEqual(path(id, "foo").reduce(book), v(1));

        book.put(id, "bar", v(2));
        assert.deepStrictEqual(path(id, "foo").reduce(book), v(1));

        book.set("foo", v("bar"));
        assert.deepStrictEqual(path(id, sym("foo")).reduce(book), v(2));

        // todo: functionをfuncとして扱う項目のテスト。不要になったら除去する
        assert.deepStrictEqual(path(id, sym("foo"), ["equals", v(2)]).reduce(book), v(true));
      });
    });
  });

  describe("stringify", () => {
    it("should return string dump", () => {
      const p = new Path(sym("self"), v("foo"));
      assert(p.stringify() === "Path [\n  self, \n  \"foo\"\n]");
    });
  });
});
