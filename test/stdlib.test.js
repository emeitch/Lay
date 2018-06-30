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
import { pack } from '../src/pack';
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

  describe("load", () => {
    it("should load prev act json string val to book", () => {
      const id = new UUID();
      const key = v("key");
      const val = v(0);
      const act = new Act(() => {
        return JSON.stringify([
          new Log(id, key, val).object(book),
        ]);
      });
      book.run(path(act, ["then", exp("load")]).deepReduce(book));
      const log = book.findLogs({id})[0];
      assert.deepStrictEqual(log.key, key);
      assert.deepStrictEqual(log.val, val);
    });

    it("should nothing to do without prev act json string", () => {
      const length = book.logs.length;
      book.run(exp("load").deepReduce(book));
      assert(length === book.logs.length);
    });
  });


  describe("filterLog", () => {
    it("should filter act arg log by pattern", () => {
      const id = new UUID();
      const key = "key";
      const val = v(0);
      book.put(id, "type", "Obj");
      const act = new Act(() => {
        return new Log(id, key, val);
      });
      let passedLog;
      const act2 = new Act(log => {
        passedLog = log;
      });
      book.run(path(act, ["then", exp("filterLog", v({"Obj": ["key"]}))], ["then", act2]).deepReduce(book));
      assert(passedLog !== null);


      book.set("Obj", new UUID()); // type assigned
      book.run(path(act, ["then", exp("filterLog", v({"Obj": ["key"]}))], ["then", act2]).deepReduce(book));
      assert(passedLog !== null);

      book.run(path(act, ["then", exp("filterLog", v({"Other": ["key"]}))], ["then", act2]).deepReduce(book));
      assert(passedLog === null);

      book.run(path(act, ["then", exp("filterLog", v({"Obj": ["other"]}))], ["then", act2]).deepReduce(book));
      assert(passedLog === null);
    });
  });

  context("accessing Object methods", () => {
    describe("all", () => {
      it("should return self instances", () => {
        book.set("Foo", book.new());
        const id1 = book.new({"type": pack(path("Foo"))});
        const id2 = book.new({"type": pack(path("Foo"))});

        const ids = path("Foo", "all").reduce(book);
        assert.deepStrictEqual(ids.get(0), id1);
        assert.deepStrictEqual(ids.get(1), id2);

        const emp = book.new();
        assert.deepStrictEqual(path(emp, "all").reduce(book), v([]));
      });
    });

    describe("allOf", () => {
      it("should return array for specified key", () => {
        const typeid = new UUID();
        const id = new UUID();
        book.put(id, "type", typeid);

        {
          const p = new Path(id, ["add", "foo", v(1)]);
          const a = p.reduce(book);
          book.run(a);
        }

        {
          const p = new Path(id, ["add", "foo", v(2)]);
          const a = p.reduce(book);
          book.run(a);
        }

        assert.deepStrictEqual(path(id, ["allOf", "foo"]).reduce(book), v([v(1), v(2)]));
      });
    });

    describe("new", () => {
      it("should return a instance creation act", () => {
        book.set("Foo", book.new());
        const act = path("Object", ["new", v({
          type: pack(path("Foo")),
          foo: v("foo"),
          bar: path([plus, v(1), v(2)]),
          buz: pack(path([plus, v(1), v(2)]))
        })]).reduce(book);

        assert.deepStrictEqual(act.constructor, Act);

        let ov;
        const act2 = act.then(new Act(id => {
          ov = id;
        }));

        book.run(act2);

        const obj = path("Foo", "all", v(0)).reduce(book);
        assert.deepStrictEqual(ov, obj);
        assert.deepStrictEqual(obj.get("foo", book), v("foo"));
        assert.deepStrictEqual(path(obj, "foo").reduce(book), v("foo"));

        assert.deepStrictEqual(obj.get("bar", book), v(3));
        assert.deepStrictEqual(path(obj, "bar").reduce(book), v(3));

        assert.deepStrictEqual(obj.get("buz", book), path([plus, v(1), v(2)]));
        assert.deepStrictEqual(path(obj, "buz").reduce(book), v(3));
      });
    });


    context("accessing Object's key", () => {
      describe("#add", () => {
        it("should return the Act which run add action", () => {
          const typeid = new UUID();
          const id = new UUID();
          book.put(id, "type", typeid);

          const p = new Path(id, ["add", "foo", v(1)]);
          const a = p.reduce(book);
          assert.deepStrictEqual(a.constructor, Act);
          book.run(a);

          const l = book.activeLog(id, "foo");
          assert.deepStrictEqual(l.val, v(1));

          const p2 = new Path(id, ["add", "foo", v(2)]);
          const a2 = p2.reduce(book);
          book.run(a2);

          const logs = book.activeLogs(id, "foo");
          assert.deepStrictEqual(logs.length, 2);
          assert.deepStrictEqual(logs[0].val, v(1));
          assert.deepStrictEqual(logs[1].val, v(2));
        });
      });

      describe("#def", () => {
        it("should return the Act which run set action", () => {
          const typeid = new UUID();
          const id = new UUID();
          book.put(id, "type", typeid);

          const p = new Path(id, ["def", "foo", exp(plus, v(1), v(2))]);
          const a = p.reduce(book);
          assert.deepStrictEqual(a.constructor, Act);
          book.run(a);

          const l = book.activeLog(id, "foo");
          assert.deepStrictEqual(l.val, exp(plus, v(1), v(2)));

          const p2 = new Path(id, ["def", "foo", exp(plus, v(2), v(3))]);
          const a2 = p2.reduce(book);
          book.run(a2);

          const logs = book.activeLogs(id, "foo");
          assert.deepStrictEqual(logs[0].val, exp(plus, v(2), v(3)));
          assert.deepStrictEqual(logs.length, 1); // invalidated old logs
        });
      });

      describe("#set", () => {
        it("should return the Act which run set action", () => {
          const typeid = new UUID();
          const id = new UUID();
          book.put(id, "type", typeid);

          const p = new Path(id, ["set", "foo", exp(plus, v(1), v(2))]);
          const a = p.reduce(book);
          assert.deepStrictEqual(a.constructor, Act);
          book.run(a);

          const l = book.activeLog(id, "foo");
          assert.deepStrictEqual(l.val, v(3));

          const p2 = new Path(id, ["set", "bar", pack(exp(plus, v(1), v(2)))]);
          const a2 = p2.reduce(book);
          assert.deepStrictEqual(a2.constructor, Act);
          book.run(a2);

          const l2 = book.activeLog(id, "bar");
          assert.deepStrictEqual(l2.val, exp(plus, v(1), v(2)));

          const p3 = new Path(id, ["set", "bar", pack(exp(plus, v(2), v(1)))]);
          const a3 = p3.reduce(book);
          book.run(a3);

          const p4 = new Path(id, ["set", "bar", pack(exp(plus, v(3), v(2)))]);
          const a4 = p4.reduce(book);
          book.run(a4);

          const logs = book.activeLogs(id, "bar");
          assert.deepStrictEqual(logs[0].val, exp(plus, v(3), v(2)));
          assert.deepStrictEqual(logs.length, 1); // invalidated old logs
        });
      });

      describe("#get", () => {
        it("should return a val for key", () => {
          const id = new UUID();

          const p = new Path(id, ["add", "foo", v(4)]);
          const a = p.reduce(book);
          book.run(a);

          const p2 = new Path(id, ["add", "foo", v(5)]);
          const a2 = p2.reduce(book);
          book.run(a2);

          const val = new Path(id, ["get", "foo"]);
          assert.deepStrictEqual(val.reduce(book), v(4));
        });

        context("exp val", () => {
          it("should retrun a reduced val", () => {
            const id = new UUID();

            const p = new Path(id, ["add", "foo", exp(plus, v(1), v(2))]);
            const a = p.reduce(book);
            book.run(a);

            const val = new Path(id, ["get", "foo"]);
            assert.deepStrictEqual(val.reduce(book), v(3));
          });
        });
      });

      describe("#getAtIndex", () => {
        it("should return a val for key and index", () => {
          const id = new UUID();

          const p = new Path(id, ["add", "foo", v(4)]);
          const a = p.reduce(book);
          book.run(a);

          const p2 = new Path(id, ["add", "foo", v(5)]);
          const a2 = p2.reduce(book);
          book.run(a2);

          const val = new Path(id, ["getAtIndex", "foo", v(0)]);
          assert.deepStrictEqual(val.reduce(book), v(4));

          const val2 = new Path(id, ["getAtIndex", "foo", v(1)]);
          assert.deepStrictEqual(val2.reduce(book), v(5));
        });

        context("exp val", () => {
          it("should retrun a reduced val", () => {
            const id = new UUID();

            const p = new Path(id, ["add", "foo", exp(plus, v(1), v(2))]);
            const a = p.reduce(book);
            book.run(a);

            const val = new Path(id, ["getAtIndex", "foo", v(0)]);
            assert.deepStrictEqual(val.reduce(book), v(3));
          });
        });
      });
    });
  });

  context("accessing String methods", () => {
    describe("trim", () => {
      it("should trim the string", () => {
        assert.deepStrictEqual(path(v("hoge   "), "trim").reduce(book), v("hoge"));
      });
    });
  });

  context("accessing Boolean methods", () => {
    describe("not", () => {
      it("should reverse logic", () => {
        assert.deepStrictEqual(path(v(true), "not").reduce(book), v(false));
        assert.deepStrictEqual(path(v(false), "not").reduce(book), v(true));
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
        const mapped = path(v([1, 2, 3]), ["map", func("x", exp(plus, "x", v(1)))]).reduce(book);
        assert.deepStrictEqual(mapped, v([2, 3, 4]));
      });
    });

    describe("every", () => {
      it("should all arg func returns true", () => {
        const f = func("x", path("x", ["equals", v(2)]));
        const e1 = path(v([2, 2, 2]), ["every", f]);
        assert.deepStrictEqual(e1.reduce(book), v(true));

        const e2 = path(v([2, 3, 2]), ["every", f]);
        assert.deepStrictEqual(e2.reduce(book), v(false));
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
        const count = path(v([1, 2, 3]), "count").reduce(book);
        assert.deepStrictEqual(count, v(3));
      });
    });

    describe("join", () => {
      it("should return joined string", () => {
        const joined = path(v(["1", "2", "3"]), ["join", ","]).reduce(book);
        assert.deepStrictEqual(joined, v("1,2,3"));
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
        const exp = path("Map", ["new", "Foo", "bar", v(1), "buz", path("Map", ["new", "Fiz", "faz", v(3)])]);
        const m = exp.deepReduce(book);
        assert.deepStrictEqual(m, v("Foo", {bar: v(1), buz: v("Fiz", {faz: v(3)})}));

        book.set("a", exp);
        assert.deepStrictEqual(path("a").deepReduce(book), v("Foo", {bar: v(1), buz: v("Fiz", {faz: v(3)})}));
      });

      context("illegal arguments", () => {
        it("should throw error", () => {
          assert.throws(() => path("Map", ["new", "Foo", "bar", v(1), "buz"]).reduce(book), /short arguments error/);
        });
      });
    });

    describe("get", () => {
      it("should return the property", () => {
        const val = path(v({a: 1, b: 2}), ["get", "b"]).reduce(book);
        assert.deepStrictEqual(val, v(2));
      });
    });
  });

  context("accessing Console methods", () => {
    describe("puts", () => {
      it("should return a Act", () => {
        const o = path("Console", ["puts", v("foo")]).reduce(book);

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
        const log1 = new Log(new UUID(), "foo", v("hoge"));
        book.putLog(log1);

        const log2 = new Log(new UUID(), "bar", v("fuga"));
        book.putLog(log2);

        const logs = path("Log", "all").reduce(book);
        assert(logs.origin.some(l => l.equals(log1.logid)));
        assert(logs.origin.some(l => l.equals(log2.logid)));
      });
    });
  });

  context("accessing Book methods", () => {
    describe("Book", () => {
      it("should return a Book type object", () => {
        const bookClass = path("Book").reduce(book);

        assert.deepStrictEqual(bookClass.constructor, UUID);
        assert.deepStrictEqual(path(book.id, "type").reduce(book), bookClass);
      });
    });

    describe("put", () => {
      it("should put a log", () => {
        const id = new UUID();
        const pact = path(book.id, ["put", id, "foo", v(1)]).reduce(book);
        book.run(pact);

        assert.deepStrictEqual(path(id, "foo").reduce(book), v(1));
      });
    });
  });

  describe("n", () => {
    it("should return array or map creation path", () => {
      const arr = n("Arr", [v(10), v(11), v(12)]);
      assert.deepStrictEqual(arr.constructor, Path);
      assert.deepStrictEqual(arr.reduce(book).get(v(0)), v(10));
      assert.deepStrictEqual(arr.reduce(book).get("head"), v("Arr"));
      assert.deepStrictEqual(arr.reduce(book).get("type"), sym("Array"));

      const narr = n([v(10), v(11), v(12)]);
      assert.deepStrictEqual(narr.constructor, Path);
      assert.deepStrictEqual(narr.reduce(book).get(v(0)), v(10));
      assert.deepStrictEqual(narr.reduce(book).get("head"), v(null));
      assert.deepStrictEqual(narr.reduce(book).get("type"), sym("Array"));

      const map = n("Mp", {foo: v("bar"), fiz: v("buz")});
      assert.deepStrictEqual(map.constructor, Path);
      assert.deepStrictEqual(map.reduce(book).get("foo"), v("bar"));
      assert.deepStrictEqual(map.reduce(book).get("head"), v("Mp"));
      assert.deepStrictEqual(map.reduce(book).get("type"), sym("Map"));

      const nmap = n({foo: v("bar"), fiz: v("buz")});
      assert.deepStrictEqual(nmap.constructor, Path);
      assert.deepStrictEqual(nmap.reduce(book).get("foo"), v("bar"));
      assert.deepStrictEqual(nmap.reduce(book).get("type"), sym("Map"));

      const nested = n({foo: {bar: v("baz")}, fiz: v("buz")});
      assert.deepStrictEqual(nested.constructor, Path);
      assert.deepStrictEqual(nested.reduce(book).get("foo"), v({bar: v("baz")}));
      assert.deepStrictEqual(nested.reduce(book).get("type"), sym("Map"));

      const nested2 = n({foo: n({bar: v("baz")}), fiz: v("buz")});
      assert.deepStrictEqual(nested2.constructor, Path);
      assert.deepStrictEqual(nested2.deepReduce(book).get("foo"), v({bar: v("baz")}));
      assert.deepStrictEqual(nested2.deepReduce(book).get("type"), sym("Map"));

      const headonly = n("foo");
      assert.deepStrictEqual(headonly.constructor, Path);
      assert.deepStrictEqual(headonly.deepReduce(book).get("head"), v("foo"));

      const withhead = n("bar", v(1));
      assert.deepStrictEqual(withhead.constructor, Path);
      assert.deepStrictEqual(withhead.deepReduce(book).get("head"), v("bar"));
      assert.deepStrictEqual(path(withhead.deepReduce(book), "head").deepReduce(book), v("bar"));
    });

    describe("reduce", () => {
      it("should return a exp", () => {
        const e = exp(plus, v(1), v(2));
        const map = n({foo: e});
        assert.deepStrictEqual(map.reduce(book).get("foo"), e);
      });
    });

    describe("deepReduce", () => {
      it("should return a exp", () => {
        const e = exp(plus, v(1), v(2));
        const map = n({foo: e});
        assert.deepStrictEqual(map.deepReduce(book).get("foo"), v(3));
      });
    });
  });
});
