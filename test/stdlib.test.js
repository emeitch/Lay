import assert from 'assert';

import { stdlib } from '../src/stdlib';
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
  context("accessing Object methods", () => {
    describe("all", () => {
      it("should return self instances", () => {
        const book = new Book(stdlib);
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

    context("accessing Object's key", () => {
      it("should return the path", () => {
        const book = new Book(stdlib);
        const tagid = new UUID();
        const id = new UUID();
        book.put(id, "tag", tagid);

        const p = new Path(id, [sym("set"), sym("foo"), v("val")]);
        assert.deepStrictEqual(p.reduce(book).constructor, Act);
      });
    });

    describe("putAct as assigned `put`", () => {
      it("should return a calling put act", () => {
        const book = new Book(stdlib);
        const id = new UUID();
        const key = new UUID();
        const val = new UUID();

        const pae = exp("put", id, key, val);
        let pa = pae.reduce(book);

        assert(!book.activeLog(id, key));
        while(!pa.settled) {
          pa = pa.proceed();
        }
        assert(book.activeLog(id, key));
      });
    });
  });

  context("accessing default Array methods", () => {
    describe("map", () => {
      it("should map arg func for items", () => {
        const book = new Book(stdlib);
        const mapped = path(v([1, 2, 3]), [sym("map"), func("x", exp(plus, "x", v(1)))]).reduce(book);
        assert.deepStrictEqual(mapped, v([2, 3, 4]));
      });
    });
  });

  context("accessing default Map methods", () => {
    describe("get", () => {
      it("should return the property", () => {
        const book = new Book(stdlib);
        const val = path(v({a: 1, b: 2}), [sym("get"), sym("b")]).reduce(book);
        assert.deepStrictEqual(val, v(2));
      });
    });
  });

  context("accessing Console methods", () => {
    describe("puts", () => {
      it("should return a Act", () => {
        const book = new Book(stdlib);
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
        const book = new Book(stdlib);

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
        const book = new Book(stdlib);

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
});
