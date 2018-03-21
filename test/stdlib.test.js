import assert from 'assert';

import { stdlib, n } from '../src/stdlib';
import v from '../src/v';
import UUID from '../src/uuid';
import Log from '../src/log';
import Book from '../src/book';
import Act from '../src/act';
import Path, { path } from '../src/path';
import { func, plus } from '../src/func';
import { exp } from '../src/exp';
import { sym } from '../src/sym';

describe("stdlib", () => {
  let book;
  beforeEach(() => {
    book = new Book(stdlib);
  });

  describe("if", () => {
    it("should test cond and reduce then exp or else exp", () => {
      const t = exp("if", v(true), v(1), v(2)).reduce(book);
      assert.deepStrictEqual(t, v(1));

      const f = exp("if", v(false), v(1), v(2)).reduce(book);
      assert.deepStrictEqual(f, v(2));
    });
  });

  context("accessing Object methods", () => {
    describe("all", () => {
      it("should return self instances", () => {
        book.set("Foo", book.new());
        const id1 = book.new({"tag": "Foo"});
        const id2 = book.new({"tag": "Foo"});

        const ids = path("Foo", "all").reduce(book);
        assert.deepStrictEqual(ids.get(0), id1);
        assert.deepStrictEqual(ids.get(1), id2);

        const emp = book.new();
        assert.deepStrictEqual(path(emp, "all").reduce(book), v([]));
      });
    });

    describe("new", () => {
      it("should return a instance creation act", () => {
        book.set("Foo", book.new());
        const act = path("Object", ["new", v({
          tag: sym("Foo"),
          foo: v("bar")
        })]).reduce(book);

        assert.deepStrictEqual(act.constructor, Act);

        book.run(act);

        assert.deepStrictEqual(path("Foo", "all", v(0), "foo").reduce(book), v("bar"));
      });
    });


    context("accessing Object's key", () => {
      it("should return the path", () => {
        const tagid = new UUID();
        const id = new UUID();
        book.put(id, "tag", tagid);

        const p = new Path(id, [sym("set"), sym("foo"), v("val")]);
        assert.deepStrictEqual(p.reduce(book).constructor, Act);
      });
    });
  });

  context("accessing Object methods", () => {
    describe("trim", () => {
      it("should trim the string", () => {
        assert.deepStrictEqual(path(v("hoge   "), "trim").reduce(book), v("hoge"));
      });
    });
  });

  context("accessing default Array methods", () => {
    describe("new", () => {
      it("should create a array", () => {
        const m = path("Array", ["new", "Foo", v(1), v(2), v(3)]).reduce(book);
        assert.deepStrictEqual(m, v("Foo", [1, 2, 3]));
      });

      it("should create a nested array", () => {
        const m = path("Array", ["new", "Foo", v(1), v(2), path("Array", ["new", "Fiz", v(3), v(4)])]).deepReduce(book);
        assert.deepStrictEqual(m, v("Foo", [v(1), v(2), v("Fiz", [v(3), v(4)])]));
      });
    });

    describe("map", () => {
      it("should map arg func for items", () => {
        const mapped = path(v([1, 2, 3]), [sym("map"), func("x", exp(plus, "x", v(1)))]).reduce(book);
        assert.deepStrictEqual(mapped, v([2, 3, 4]));
      });
    });

    describe("filter", () => {
      it("should filter arg func for items", () => {
        const filtered = path(v([1, 2, 3]), ["filter", func("x", path("x", ["equals", v(2)]))]).reduce(book);
        assert.deepStrictEqual(filtered, v([2]));
      });
    });

    describe("count", () => {
      it("should return size of array", () => {
        const count = path(v([1, 2, 3]), sym("count")).reduce(book);
        assert.deepStrictEqual(count, v(3));
      });
    });
  });

  context("accessing default Map methods", () => {
    describe("new", () => {
      it("should create a map", () => {
        const m = path("Map", ["new", "Foo", "bar", v(1), "buz", v(2)]).reduce(book);
        assert.deepStrictEqual(m, v("Foo", {bar: v(1), buz: v(2)}));
      });

      it("should create a nested map", () => {
        const m = path("Map", ["new", "Foo", "bar", v(1), "buz", path("Map", ["new", "Fiz", "faz", v(3)])]).deepReduce(book);
        assert.deepStrictEqual(m, v("Foo", {bar: v(1), buz: v("Fiz", {faz: v(3)})}));
      });
    });

    describe("get", () => {
      it("should return the property", () => {
        const val = path(v({a: 1, b: 2}), [sym("get"), sym("b")]).reduce(book);
        assert.deepStrictEqual(val, v(2));
      });
    });
  });

  context("accessing Console methods", () => {
    describe("puts", () => {
      it("should return a Act", () => {
        const o = path("Console", [sym("puts"), v("foo")]).reduce(book);

        // stub
        const orig = console.log;
        console.log = arg => {
          assert.deepStrictEqual(arg, "foo");
        };
        o.id.proceed();
        console.log = orig;
      });
    });
  });

  context("accessing Act methods", () => {
    describe("then", () => {
      it("should return a chained Act", () => {
        const f1 = () => {};
        const f2 = () => {};
        const a1 = new Act(f1);
        const a2 = new Act(f2);

        const act = path(a1, ["then", a2]).reduce(book);
        assert(act.executor === f1);
        assert(act.next.executor === f2);
      });
    });
  });

  context("accessing Log methods", () => {
    describe("all", () => {
      it("should return all logs", () => {
        const log1 = new Log(new UUID(), sym("foo"), v("hoge"));
        book.putLog(log1);

        const log2 = new Log(new UUID(), sym("bar"), v("fuga"));
        book.putLog(log2);

        const logs = path("Log", "all").reduce(book);
        assert(logs.origin.some(l => l.equals(log1.logid)));
        assert(logs.origin.some(l => l.equals(log2.logid)));
      });
    });
  });

  describe("n", () => {
    it("should return array or map creation path", () => {
      const arr = n("Arr", [v(10), v(11), v(12)]);
      assert.deepStrictEqual(arr.constructor, Path);
      assert.deepStrictEqual(arr.reduce(book).get(v(0)), v(10));
      assert.deepStrictEqual(arr.reduce(book).get("tag"), sym("Arr"));

      const narr = n([v(10), v(11), v(12)]);
      assert.deepStrictEqual(narr.constructor, Path);
      assert.deepStrictEqual(narr.reduce(book).get(v(0)), v(10));
      assert.deepStrictEqual(narr.reduce(book).get("tag"), sym("Array"));

      const map = n("Mp", {foo: v("bar"), fiz: v("buz")});
      assert.deepStrictEqual(map.constructor, Path);
      assert.deepStrictEqual(map.reduce(book).get("foo"), v("bar"));
      assert.deepStrictEqual(map.reduce(book).get("tag"), sym("Mp"));

      const nmap = n({foo: v("bar"), fiz: v("buz")});
      assert.deepStrictEqual(nmap.constructor, Path);
      assert.deepStrictEqual(nmap.reduce(book).get("foo"), v("bar"));
      assert.deepStrictEqual(nmap.reduce(book).get("tag"), sym("Map"));
    });
  });
});
