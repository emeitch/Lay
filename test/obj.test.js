import assert from 'assert';

import v from '../src/v';
import { sym } from '../src/sym';
import UUID from '../src/uuid';
import Path from '../src/path';
import Log from '../src/log';
import Book from '../src/book';
import { exp } from '../src/exp';
import { func, plus } from '../src/func';
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
      it("should return null", () => {
        assert(obj.get(key) === null);
      });
    });

    context("with a log which has a val typed by UUID", () => {
      const dst = new UUID();

      beforeEach(() => {
        book.putLog(new Log(id, key, dst));
      });

      it("should return a obj of log's val", () => {
        assert.deepStrictEqual(obj.get(key), book.obj(dst));
      });
    });

    context("with a log which has a val typed by Val", () => {
      beforeEach(() => {
        book.putLog(new Log(id, key, v("value")));
      });

      it("should return a value", () => {
        assert.deepStrictEqual(obj.get(key), book.obj(v("value")));
      });
    });

    context("with the same key but different val logs", () => {
      beforeEach(() => {
        book.putLog(new Log(id, key, v("val0")));
        book.putLog(new Log(id, key, v("val1")));
      });

      it("should return the last val", () => {
        assert.deepStrictEqual(obj.get(key), book.obj(v("val1")));
      });
    });

    context("with a invalidated log", () => {
      beforeEach(() => {
        const log = book.putLog(new Log(id, key, v("val0")));
        book.putLog(new Log(log.logid, invalidate));
      });

      it("should return null", () => {
        assert.deepStrictEqual(obj.get(key), null);
      });

      context("add another log", () => {
        beforeEach(() => {
          book.putLog(new Log(id, key, v("val1")));
        });

        it("should return the val", () => {
          assert.deepStrictEqual(obj.get(key), book.obj(v("val1")));
        });
      });

      context("add a log which has same args for the invalidated log", () => {
        beforeEach(() => {
          book.putLog(new Log(id, key, v("val0")));
        });

        it("should return the val", () => {
          assert.deepStrictEqual(obj.get(key), book.obj(v("val0")));
        });
      });
    });

    context("with a absolute path", () => {
      beforeEach(() => {
        const id2 = new UUID();
        const id3 = new UUID();
        const key2 = new UUID();
        const key3 = new UUID();

        book.putLog(new Log(id2, key2, id3));
        book.putLog(new Log(id3, key3, v("path end")));
        book.putLog(new Log(id, key, new Path(id2, key2, key3)));
      });

      it("should return the val", () => {
        assert.deepStrictEqual(obj.get(key), book.obj(v("path end")));
      });
    });

    context("with a relative path", () => {
      let val2;
      beforeEach(() => {
        val2 = v("val0");
        const key2 = new UUID();

        book.putLog(new Log(id, key2, val2));
        book.putLog(new Log(id, key, new Path(sym("self"), key2)));
      });

      it("should return the val", () => {
        assert.deepStrictEqual(obj.get(key), book.obj(val2));
      });
    });

    context("with a relative reference exp", () => {
      let val2;
      beforeEach(() => {
        val2 = v(1);
        const key2 = new UUID();

        book.putLog(new Log(id, key2, val2));
        book.putLog(new Log(id, key, exp(plus, new Path(sym("self"), key2), v(2))));
      });

      it("should return the reduced val", () => {
        assert.deepStrictEqual(obj.get(key), book.obj(v(3)));
      });
    });

    context("with a map val", () => {
      let val;
      beforeEach(() => {
        val = v({a: 1, b: {c: 2, d: 3}});
        book.putLog(new Log(id, key, val));
      });

      it("should return the val", () => {
        assert.deepStrictEqual(obj.get(key), book.obj(val));
      });

      it("should return the val as a obj", () => {
        assert.deepStrictEqual(obj.get(key), book.obj(val));
      });

      it("should return the property", () => {
        const map = obj.get(key);
        assert.deepStrictEqual(map.get("a"), book.obj(v(1)));
      });

      it("should return the nested property", () => {
        const map = obj.get(key).get("b");
        assert.deepStrictEqual(map.get("d"), book.obj(v(3)));
      });
    });

    context("with a directed specified map val obj", () => {
      beforeEach(() => {
        book.set("Foo", v({e: 4}));
        const val = v("Foo", {a: 1, b: {c: 2, d: 3}});
        obj = book.obj(val);
      });

      it("should return the nested property", () => {
        assert.deepStrictEqual(obj.get("b").get("d"), book.obj(v(3)));
      });

      it("should return the prototype property", () => {
        assert.deepStrictEqual(obj.get("e"), book.obj(v(4)));
      });
    });

    context("with a directed specified map val obj unreferenced head", () => {
      beforeEach(() => {
        book.set("Foo", v({e: 4}));
        const val = v("Bar", {a: 1, b: {c: 2, d: 3}});
        obj = book.obj(val);
      });

      it("should return the nested property", () => {
        assert.deepStrictEqual(obj.get("b").get("d"), book.obj(v(3)));
      });

      it("should return the head sym", () => {
        assert.deepStrictEqual(obj.get("e"), book.obj(sym("Bar")));
      });
    });
  });

  describe("set", () => {
    context("with a UUID val", () => {
      const dst = new UUID();

      let ret;
      beforeEach(() => {
        ret = obj.set(key, dst);
      });

      it("should set a property", () => {
        assert.deepStrictEqual(obj.get(key), book.obj(dst));
      });

      it("should return the obj", () => {
        assert(ret, obj);
      });
    });

    context("with a obj val", () => {
      let obj2;
      beforeEach(() => {
        obj2 = book.obj(new UUID());
        obj.set(key, obj2);
      });

      it("should return a obj", () => {
        assert.deepStrictEqual(obj.get(key), obj2);
      });
    });

    context("map obj", () => {
      beforeEach(() => {
        obj = book.obj(v({a: 1, b: 2}));
      });

      it("should throw a error", () => {
        assert.throws(() => obj.set("b", book.obj(v({c: 4, d: 5}))), /Obj#set method unsupported for comp id/);
      });
    });

  });

  describe("send", () => {
    context("with a relative reference func", () => {
      let val2;
      beforeEach(() => {
        val2 = v(1);
        const key2 = new UUID();

        book.putLog(new Log(id, key2, val2));
        book.putLog(new Log(id, key, func("x", exp(plus, new Path(sym("self"), key2), "x"))));
      });

      it("should return the reduced val as methods", () => {
        assert.deepStrictEqual(obj.send(key, v(2)), book.obj(v(3)));
      });
    });

    context("returning reference func", () => {
      const ref = new UUID();
      beforeEach(() => {
        const key2 = new UUID();

        book.putLog(new Log(id, key2, ref));
        book.putLog(new Log(id, key, new Path(sym("self"), key2)));
      });

      it("should return a obj wrapping the ref", () => {
        assert.deepStrictEqual(obj.send(key), book.obj(ref));
      });
    });

    // adhoc specification
    context("accessing default Object methods", () => {
      describe("set", () => {
        beforeEach(() => {
          book.put(id, key, v(1));
        });

        it("should execute the act that returned set method", () => {
          obj.send(v("set"), v("key2"), v(2));
          assert.deepStrictEqual(obj.send(v("key2")), book.obj(v(2)));
        });
      });

      describe("all", () => {
        const id2 = new UUID();
        const id3 = new UUID();
        beforeEach(() => {
          book.set("Foo", id);
          book.put(id2, v("tag"), sym("Foo"));
          book.put(id3, v("tag"), sym("Foo"));
        });

        it("should return tagged objs array comp", () => {
          const all = obj.send(v("all"));
          assert.deepStrictEqual(all.get(0), book.obj(id2));
          assert.deepStrictEqual(all.get(1), book.obj(id3));
        });
      });
    });

    context("lazy definition", () => {
      it("should be able to define tags", () => {
        book.put(id, v("tag"), sym("Tag1"));
        assert(obj.send(v("foo")).origin !== "bar");

        const tag = new UUID();
        book.set(v("Tag1"), tag);
        book.put(tag, v("foo"), v("bar"));

        assert(obj.send(v("foo")).origin === "bar");
      });
    });
  });

  describe("keys", () => {
    let key2 = v("key2");
    beforeEach(() => {
      book.put(id, key, v(1));
      book.put(id, key2, v(2));
    });

    it("should return keys", () => {
      assert.deepStrictEqual(obj.keys(), [key, key2]);
    });
  });

  describe("stringify", () => {
    it("should return string dump", () => {
      assert(obj.stringify() === id.stringify());
    });
  });

  describe("name", () => {
    it("should return assigned name on book", () => {
      book.set("Foo", id);
      assert(obj.name.equals(v("Foo")));
    });
  });

  describe("all", () => {
    it("should return tagged objs", () => {
      assert.deepStrictEqual(obj.all, []);

      const id2 = new UUID();
      const id3 = new UUID();
      const id4 = new UUID();
      book.set("Foo", id);
      book.put(id2, v("tag"), sym("Foo"));
      book.put(id3, v("tag"), sym("Foo"));
      book.put(id4, v("tag"), sym("Foo"));

      const all = obj.all;
      assert.deepStrictEqual(all[0], book.obj(id2));
      assert.deepStrictEqual(all[1], book.obj(id3));
      assert.deepStrictEqual(all[2], book.obj(id4));
    });
  });

});
