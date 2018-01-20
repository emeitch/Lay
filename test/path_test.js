import assert from 'assert';

import v from '../src/v';
import Path, { path } from '../src/path';
import UUID from '../src/uuid';
import Act from '../src/act';
import { sym } from '../src/sym';
import { exp } from '../src/exp';
import { func, plus } from '../src/func';
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
      const val3 = v("val0");

      beforeEach(() => {
        book.putLog(new Log(id, key, id2));
        book.putLog(new Log(id2, key2, new Path(sym("self"), key3)));
        book.putLog(new Log(id2, key3, val3));
        book.set("a", id);
        p = new Path(sym("a"), key, key2);
      });

      it("should return the val", () => {
        assert.deepStrictEqual(p.reduce(book), val3);
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

    context("access a key only its tag has the key", () => {
      const id = new UUID();

      beforeEach(() => {
        const tagid1 = new UUID();
        const tagid2 = new UUID();
        const tagid3 = new UUID();

        book.set("parent1", tagid1);
        book.set("parent2", tagid2);
        book.set("grandparent", tagid3);

        book.put(id, "tag", sym("parent1"));
        book.put(id, "tag", sym("parent2"));
        book.put(tagid2, "tag", sym("grandparent"));

        book.put(tagid1, "foo", v(1));
        book.put(tagid2, "foo", v(2));
        book.put(tagid2, "bar", v(3));
        book.put(tagid3, "baz", v(4));
      });

      it("should return the tag's val", () => {
        const p1 = new Path(id, v("foo"));
        assert.deepStrictEqual(p1.reduce(book), v(1));

        const p2 = new Path(id, v("bar"));
        assert.deepStrictEqual(p2.reduce(book), v(3));

        const p3 = new Path(id, v("baz"));
        assert.deepStrictEqual(p3.reduce(book), v(4));
      });
    });

    context("path referencing tag", () => {
      const id = new UUID();

      beforeEach(() => {
        const tagid1 = new UUID();

        book.set("parent1", tagid1);

        book.put(id, "tag", path(sym("self"), v("baz")));
        book.put(id, "baz", sym("parent1"));

        book.put(tagid1, "foo", v("bar"));
      });

      it("should return the tag's val", () => {
        const p1 = new Path(id, v("foo"));
        assert.deepStrictEqual(p1.reduce(book), v("bar"));
      });
    });

    context("tag by path with args", () => {
      const id = new UUID();

      beforeEach(() => {
        const tagid1 = new UUID();

        book.set("parent1", tagid1);

        book.put(id, "tag", path(sym("self"), [v("baz"), sym("parent1")]));
        book.put(id, "baz", func("arg", sym("arg")));

        book.put(tagid1, "foo", v("bar"));
      });

      it("should return the tag's val", () => {
        const p1 = new Path(id, v("foo"));
        assert.deepStrictEqual(p1.reduce(book), v("bar"));
      });
    });

    context("accessing Object's key", () => {
      const id = new UUID();

      beforeEach(() => {
        const tagid = new UUID();
        book.put(id, "tag", tagid);
      });

      it("should return the path", () => {
        const p = new Path(id, [v("set"), v("foo"), v("val")]);
        assert.deepStrictEqual(p.reduce(book).constructor, Act);
      });
    });


    context("with tag but it dosen't have the key", () => {
      const id = new UUID();

      beforeEach(() => {
        const tagid = new UUID();
        book.put(id, "tag", tagid);
      });

      it("should return the path", () => {
        const p = new Path(id, v("foo"));
        assert.deepStrictEqual(p.reduce(book), p);
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
  });

  describe("stringify", () => {
    it("should return string dump", () => {
      const p = new Path(sym("self"), v("foo"));
      assert(p.stringify() === "Path [\n  self, \n  \"foo\"\n]");
    });
  });
});
