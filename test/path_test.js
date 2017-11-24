import assert from 'assert';

import v from '../src/v';
import Path from '../src/path';
import UUID from '../src/uuid';
import { sym } from '../src/sym';
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

  describe("#id", () => {
    it("should return oneself", () => {
      assert.deepStrictEqual(p.id, p);
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

  describe("#toString", () => {
    it("should return ids joined by slash", () => {
      assert.deepStrictEqual(p.toString(),`${id1}/${id2}/${id3}`);
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
        book.put(new Log(id, key, id2));
        book.put(new Log(id2, key2, id3));
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
        book.put(new Log(id, key, val));
        book.assign("a", id);
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
        book.put(new Log(id, key, id2));
        book.put(new Log(id2, key2, new Path(sym("self"), key3)));
        book.put(new Log(id2, key3, val3));
        book.assign("a", id);
        p = new Path(sym("a"), key, key2);
      });

      it("should return the val", () => {
        assert.deepStrictEqual(p.reduce(book), val3);
      });
    });

    context("unknown path", () => {
      const id = new UUID();
      const unknownKey1 = new UUID();
      const unknownKey2 = new UUID();

      beforeEach(() => {
        p = new Path(id, unknownKey1, unknownKey2);
      });

      it("should raise exception", () => {
        assert.deepStrictEqual(p.reduce(book), p);
      });
    });
  });
});
