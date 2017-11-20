import assert from 'assert';

import { v } from '../src/val';
import { sym } from '../src/sym';
import UUID from '../src/uuid';
import Path from '../src/path';
import Log from '../src/log';
import Book from '../src/book';
import { invalidate } from '../src/ontology';

describe("Obj", () => {
  const id = new UUID();
  const key = new UUID();

  let book;
  let obj;
  beforeEach(() => {
    book = new Book();
    obj = book.obj(id);
  });

  describe("#get", () => {
    context("without logs", () => {
      it("should return undefined", () => {
        assert(obj.get(key) === undefined);
      });
    });

    context("with a log which has a val typed by UUID", () => {
      const dst = new UUID();

      beforeEach(() => {
        book.put(new Log(id, key, dst));
      });

      it("should return a obj of log's val", () => {
        assert.deepStrictEqual(obj.get(key), book.obj(dst));
      });
    });

    context("with a log which has a val typed by Val", () => {
      beforeEach(() => {
        book.put(new Log(id, key, v("value")));
      });

      it("should return a value", () => {
        assert.deepStrictEqual(obj.get(key), v("value"));
      });
    });

    context("with the same key but different val logs", () => {
      beforeEach(() => {
        book.put(new Log(id, key, v("val0")));
        book.put(new Log(id, key, v("val1")));
      });

      it("should return the last val", () => {
        assert.deepStrictEqual(obj.get(key), v("val1"));
      });
    });

    context("with a invalidated log", () => {
      beforeEach(() => {
        const log = book.put(new Log(id, key, v("val0")));
        book.put(new Log(log.logid, invalidate));
      });

      it("should return undefined", () => {
        assert.deepStrictEqual(obj.get(key), undefined);
      });

      context("add another log", () => {
        beforeEach(() => {
          book.put(new Log(id, key, v("val1")));
        });

        it("should return the val", () => {
          assert.deepStrictEqual(obj.get(key), v("val1"));
        });
      });

      context("add a log which has same args for the invalidated log", () => {
        beforeEach(() => {
          book.put(new Log(id, key, v("val0")));
        });

        it("should return the val", () => {
          assert.deepStrictEqual(obj.get(key), v("val0"));
        });
      });
    });

    context("with a absolute path", () => {
      beforeEach(() => {
        const id2 = new UUID();
        const id3 = new UUID();
        const key2 = new UUID();
        const key3 = new UUID();

        book.put(new Log(id2, key2, id3));
        book.put(new Log(id3, key3, v("path end")));
        book.put(new Log(id, key, new Path(id2, key2, key3)));
      });

      it("should return the val", () => {
        assert.deepStrictEqual(obj.get(key), v("path end"));
      });
    });

    context("with a relative path", () => {
      let val2;
      beforeEach(() => {
        val2 = v("val0");
        const key2 = new UUID();

        book.put(new Log(id, key2, val2));
        book.put(new Log(id, key, new Path(sym("self"), key2)));
      });

      it("should return the val", () => {
        assert.deepStrictEqual(obj.get(key), val2);
      });
    });

    context("with a map val", () => {
      let val;
      beforeEach(() => {
        val = v({a: 1, b: {c: 2, d: 3}});
        book.put(new Log(id, key, val));
      });

      it("should return the val", () => {
        assert.deepStrictEqual(obj.get(key), val);
      });

      it("should return the val as a obj", () => {
        assert.deepStrictEqual(obj.get(key), book.obj(val));
      });

      it("should return the property", () => {
        const map = obj.get(key);
        assert.deepStrictEqual(map.get("a"), v(1));
      });

      it("should return the nested property", () => {
        const map = obj.get(key).get("b");
        assert.deepStrictEqual(map.get("d"), v(3));
      });
    });
  });
});
