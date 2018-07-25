import assert from 'assert';

import v from '../src/v';
import UUID from '../src/uuid';
import Log from '../src/log';
import Book from '../src/book';
import Act from '../src/act';
import { path } from '../src/path';
import { sym } from '../src/sym';
import { pack } from '../src/pack';
import { transaction, invalidate } from '../src/ontology';

describe("Book", () => {
  const id = new UUID();
  const key = new UUID();
  const val = new UUID();

  let book;
  beforeEach(() => {
    book = new Book();
  });

  describe("#id", () => {
    it("should return the book uuid", () => {
      assert.deepStrictEqual(book.id.constructor, UUID);
    });

    describe("#type", () => {
      it("should return a path to 'Book'", () => {
        assert.deepStrictEqual(path(book.id, "type").reduce(book), sym("Book"));
      });
    });
  });

  describe("currentBookId", () => {
    it("should return the current book id", () => {
      assert.deepStrictEqual(path("currentBookId").reduce(book), book.id);
    });
  });

  describe("#putLog", () => {
    context("standard arguments", () => {
      let log;
      beforeEach(() => {
        log = new Log(id, key, val);
        book.putLog(log);
      });

      it("should append a log", () => {
        assert(log.id === id);
        assert(log.key === key);
        assert(log.val === val);
        assert(book.log(log.logid) === log);
      });

      it("should append a transaction log", () => {
        const tlogs = book.findLogs({id: log.logid, key: transaction});
        assert(tlogs.length === 1);
      });
    });

    context("with time", () => {
      const time = new Date(2017, 0);

      let log;
      beforeEach(() => {
        log = new Log(id, key, val, time);
        book.putLog(log);
      });

      it("should append a log with time", () => {
        assert(log.id === id);
        assert(log.key === key);
        assert(log.val === val);
        assert(log.at === time);
        assert(book.log(log.logid) === log);

        assert(log.logid.get("id", book) === id);
      });
    });
  });

  describe("#put", () => {
    context("standard arguments with time", () => {
      const time = new Date(2017, 0);

      let log;
      beforeEach(() => {
        log = book.put(id, key, val, time);
      });

      it("should append a log", () => {
        assert(log.id === id);
        assert(log.key === key);
        assert(log.val === val);
        assert(log.at === time);
        assert(book.log(log.logid) === log);
      });
    });
  });

  describe("putAct", () => {
    it("should return a calling put act", () => {
      const id = new UUID();
      const key = new UUID();
      const val = new UUID();

      const pae = book.putAct(id, key, val);
      let pa = pae.reduce(book);

      assert(!book.activeLog(id, key));
      while(!pa.settled) {
        pa = pa.proceed();
      }
      assert(book.activeLog(id, key));
    });
  });

  describe("#transactionID", () => {
    let tid;
    beforeEach(() => {
      const log = new Log(id, key, val);
      book.putLog(log);
      tid = book.transactionID(log);
    });

    it("should has no more transaction", () => {
      assert.deepStrictEqual(book.transactionID(tid), null);
    });
  });

  describe("#get", () => {
    context("name un assigned", () => {
      it("should return null", () => {
        assert.deepStrictEqual(book.get("unassigned"), undefined);
      });
    });

    context("name assigned", () => {
      beforeEach(() => {
        book.set(v("i"), id);
        book.set("k", key);
        book.set("v", val);
      });

      it("should return a id by name", () => {
        assert(book.get("i") === id);
        assert(book.get("k") === key);
        assert(book.get("v") === val);
      });

      context("name re-assigned", () => {
        const key2 = new UUID();

        beforeEach(() => {
          book.set("r", key2);
        });

        it("should return a re-assigned id by name", () => {
          assert(book.get("r") === key2);
        });
      });

      context("parent-child", () => {
        it("should return a parent assigned value", () => {
          const cbook = new Book(book);
          assert(cbook.get("i") === id);
        });
      });
    });
  });

  describe("Val#get", () => {
    context("prototype assigned", () => {
      beforeEach(() => {
        book.set("Number", id);
        book.put(id, "foo", v("bar"));
      });

      it("should return type's prop", () => {
        assert.deepStrictEqual(v(1).get("foo", book), v("bar"));
      });

      it("should return id's prop", () => {
        assert.deepStrictEqual(id.get("foo", book), v("bar"));
        assert.deepStrictEqual(id.get("type", book), sym("UUID"));
        assert.deepStrictEqual(id.get("type"), sym("UUID"));
      });
    });
  });

  describe("#name", () => {
    it("should return assigned name", () => {
      book.set("Foo", id);
      assert.deepStrictEqual(book.name(id), v("Foo"));
      assert.deepStrictEqual(book.name(new UUID()), v(null));
    });
  });

  describe("#activeLogs", () => {
    context("no logs", () => {
      it("should return empty", () => {
        const logs = book.activeLogs(id, key);
        assert(logs.length === 0);
      });
    });

    context("logs with same ids & keys but different vals", () => {
      beforeEach(() => {
        book.putLog(new Log(id, key, v("val0")));
        book.putLog(new Log(id, key, v("val1")));
      });

      it("should return all logs", () => {
        const logs = book.activeLogs(id, key);
        assert.deepStrictEqual(logs[0].val, v("val0"));
        assert.deepStrictEqual(logs[1].val, v("val1"));
      });

      context("invalidate the last log", () => {
        beforeEach(() => {
          const log = book.activeLog(id, key);
          book.putLog(new Log(log.logid, invalidate));
        });

        it("should return only the first log", () => {
          const logs = book.activeLogs(id, key);
          assert.deepStrictEqual(logs[0].val, v("val0"));
          assert(!logs[1]);
        });
      });
    });

    context("logs with applying time", () => {
      beforeEach(() => {
        book.putLog(new Log(id, key, v("val0"), new Date(2017, 0)));
        book.putLog(new Log(id, key, v("val1"), new Date(2017, 2)));
      });

      it("should return all logs", () => {
        const logs = book.activeLogs(id, key);
        assert.deepStrictEqual(logs[0].val, v("val0"));
        assert.deepStrictEqual(logs[1].val, v("val1"));
      });

      it("should return only the first log by specifying time before applied", () => {
        const logs = book.activeLogs(id, key, new Date(2017, 1));
        assert.deepStrictEqual(logs[0].val, v("val0"));
        assert(!logs[1]);
      });

      context("invalidate the last log", () => {
        beforeEach(() => {
          const log = book.activeLog(id, key);
          book.putLog(new Log(log.logid, invalidate));
        });

        it("should return only the first log", () => {
          const logs = book.activeLogs(id, key);
          assert.deepStrictEqual(logs[0].val, v("val0"));
          assert(!logs[1]);
        });
      });

      context("invalidate the last log with applying time", () => {
        beforeEach(() => {
          const log = book.activeLog(id, key);
          book.putLog(new Log(log.logid, invalidate, null, new Date(2017, 4)));
        });

        it("should return only the first log", () => {
          const logs = book.activeLogs(id, key, new Date(2017, 6));
          assert.deepStrictEqual(logs[0].val, v("val0"));
          assert(!logs[1]);
        });

        it("should return only the first log by time specified just invalidation time", () => {
          const logs = book.activeLogs(id, key, new Date(2017, 4));
          assert.deepStrictEqual(logs[0].val, v("val0"));
          assert(!logs[1]);
        });

        it("should return all logs by time specified before invalidation", () => {
          const logs = book.activeLogs(id, key, new Date(2017, 3));
          assert.deepStrictEqual(logs[0].val, v("val0"));
          assert.deepStrictEqual(logs[1].val, v("val1"));
        });
      });
    });

    context("contain logs with old applying time", () => {
      beforeEach(() => {
        book.putLog(new Log(id, key, v("val0"), new Date(2017, 1)));
        book.putLog(new Log(id, key, v("val1"), new Date(2017, 0)));
      });

      it("should return all logs order by applying time", () => {
        const logs = book.activeLogs(id, key);
        assert.deepStrictEqual(logs[0].val, v("val1"));
        assert.deepStrictEqual(logs[1].val, v("val0"));
      });

      context("invalidate the last log", () => {
        beforeEach(() => {
          const log = book.activeLog(id, key);
          book.putLog(new Log(log.logid, invalidate));
        });

        it("should return only the first log", () => {
          const logs = book.activeLogs(id, key);
          assert.deepStrictEqual(logs[0].val, v("val1"));
          assert(!logs[1]);
        });
      });
    });

    context("contain a log with time and a log without time", () => {
      beforeEach(() => {
        book.putLog(new Log(id, key, v("val0")));
        book.putLog(new Log(id, key, v("val1"), new Date(2017, 2)));
      });

      it("should return all logs order by applying time", () => {
        const logs = book.activeLogs(id, key);
        assert.deepStrictEqual(logs[0].val, v("val1"));
        assert.deepStrictEqual(logs[1].val, v("val0"));
      });
    });
  });

  describe("#activeLog", () => {
    context("no logs", () => {
      it("should return empty", () => {
        const log = book.activeLog(id, key);
        assert(!log);
      });
    });

    context("logs with applying time", () => {
      beforeEach(() => {
        book.putLog(new Log(id, key, v("val0"), new Date(2017, 0)));
        book.putLog(new Log(id, key, v("val1"), new Date(2017, 2)));
      });

      it("should return the last log", () => {
        const log = book.activeLog(id, key);
        assert.deepStrictEqual(log.val, v("val1"));
      });

      it("should return the first log by specifying time", () => {
        const log = book.activeLog(id, key, new Date(2017, 1));
        assert.deepStrictEqual(log.val, v("val0"));
      });
    });
  });

  describe("#instanceIDs", () => {
    let t1;

    let id0;
    let id1;
    let id2;
    beforeEach(() => {
      t1 = book.new();
      book.set("T1", t1);

      id0 = book.new({"type": pack(path("T1"))});
      id1 = book.new({"type": pack(path("T1"))});
      id2 = book.new({"type": pack(path("T1"))});
    });

    it("should return type object id list", () => {
      assert.deepStrictEqual(book.instanceIDs(t1), [id0, id1, id2]);

      const t2 = book.new();
      assert.deepStrictEqual(book.instanceIDs(t2), []);
    });

    context("set exists false", () => {
      beforeEach(() => {
        book.put(id1, "exists", v(false));
      });

      it("should return new generated ids", () => {
        const ids = book.instanceIDs(t1);
        assert(ids.length === 2);
        assert(ids[0] === id0);
        assert(ids[1] === id2);
      });
    });
  });

  describe("#new", () => {
    it("should return new id", () => {
      const id = book.new();
      assert(id.constructor === UUID);

      const logs = book.activeLogs(id, v("exists"));
      assert(logs.length > 0);
    });

    context("with properties", () => {
      it("should return the set properties", () => {
        const id = book.new({
          foo: 1,
          bar: v("bar"),
          baz: "baz"
        });

        assert.deepStrictEqual(id.get(v("foo"), book), v(1));
        assert.deepStrictEqual(id.get(v("bar"), book), v("bar"));
        assert.deepStrictEqual(id.get(v("baz"), book), v("baz"));

        assert(book.findLogs({key: v("foo")}).length === 1);
      });
    });
  });

  describe("#findLogs", () => {
    it("should return the logs with sym completion", () => {
      book.put(id, "foo", v(1));

      assert(book.findLogs({key: v("foo")}).length === 1);
      assert(book.findLogs({key: "foo"}).length === 1);
      assert(book.findLogs({key: sym("foo")}).length === 0);
    });
  });

  describe("#import", () => {
    it("should add search target books", () => {
      const alib1 = new Book();
      alib1.put(new UUID(), "bar", v(1));

      const alib2 = new Book();
      alib2.put(new UUID(), "baz", v(2));

      const lib = new Book(alib1, alib2);
      const id2 = new UUID();
      const log = lib.put(id2, "foo", v(3));
      lib.set("bar", v(4));
      book.import(lib);

      assert(book.findLogs({key: v("bar")}).length === 1);
      assert(book.findLogs({key: v("baz")}).length === 1);

      assert(book.findLogs({key: v("foo")}).length === 1);
      assert(book.activeLogs(id2, v("foo")).length === 1);
      assert.deepStrictEqual(book.get("bar"), v(4));
      assert(book.logIDs().some(lid => lid.equals(log.logid)));
    });

    context("with name", () => {
      it("should assign a imported book to name", () => {
        const lib = new Book();
        book.import(lib, "foo");

        assert.deepStrictEqual(path("foo").reduce(book), lib.id);
      });
    });

    context("set up onImport", () => {
      it("should run the returned act", () => {
        let b = 0;
        const alib = new Book();
        alib.set("onImport", new Act(() => { b = 1; }));
        const lib = new Book(alib);
        assert.deepStrictEqual(b, 1);

        let a = 0;
        lib.set("onImport", new Act(() => { a = 1; }));
        book.import(lib);

        assert.deepStrictEqual(a, 1);
      });
    });

    context("set up onPut", () => {
      it("should run the returned act", () => {
        let b = 0;
        const alib = new Book();
        alib.set("onPut", new Act(log => {
          if (log.key.equals(v("foo"))) {
            b += 1;
          }
        }));

        let a = 0;
        const lib = new Book(alib);
        lib.set("onPut", new Act(log => {
          if (log.key.equals(v("foo"))) {
            a += 1;
          }
        }));
        book.import(lib);

        book.put(new UUID(), "foo", v(1));
        assert.deepStrictEqual(a, 1);
        assert.deepStrictEqual(b, 1);

        book.put(new UUID(), "foo", v(1));
        assert.deepStrictEqual(a, 2);
        assert.deepStrictEqual(b, 2);
      });
    });
  });

  describe("#existsIDs", () => {
    it("should return new generated ids", () => {
      const o0 = book.new();
      const o1 = book.new();
      const o2 = book.new();

      const ids = book.existsIDs();
      assert(ids.length === 3);
      assert(ids[0] === o0);
      assert(ids[1] === o1);
      assert(ids[2] === o2);
    });
  });

  describe("findActiveLogs", () => {
    context("invalidate the last log", () => {
      beforeEach(() => {
        book.put(id, key, v("val0"));
        book.put(id, key, v("val1"));

        const log = book.activeLog(id, key);
        book.put(log.logid, invalidate);
      });

      it("should return only the first log", () => {
        const logs = book.findActiveLogs({id});
        assert.deepStrictEqual(logs[0].val, v("val0"));
        assert(!logs[1]);
      });
    });
  });

  describe("run", () => {
    it("should execute arg Act", () => {
      const book = new Book();
      book.run(v(1)); // pass

      let a = 0;
      book.run(new Act(() => { a = 1; }));
      assert.deepStrictEqual(a, 1);

      let b = 0;
      book.run(v([new Act(() => { a = 2; }), new Act(() => { b = 2; })]));
      assert.deepStrictEqual(a, 2);
      assert.deepStrictEqual(b, 2);
    });

    context("with error act", () => {
      it("should recovery error", () => {
        const book = new Book();

        let err;
        const act = new Act(() => {
          throw "error";
        }).catch(new Act(e => {
          err = e;
        }));

        book.run(act);
        assert.deepStrictEqual(err, "error");
      });
    });

    context("with not act val", () => {
      it("should return null", () => {
        const book = new Book();
        assert.throws(() => book.run(v([1])), /not Act instance:/);
      });
    });
  });
});

describe("Book", () => {
  let book;
  beforeEach(() => {
    book = new Book();
  });

  describe("putLog", () => {
    it("should put for first imported book", () => {
      const id = new UUID();

      const importer = new Book();
      importer.put(id, "k1", v("v1"));
      assert(book.findLogs({id: id}).length == 0);
      assert(importer.findLogs({id: id}).length == 1);

      importer.import(book);

      importer.put(id, "k2", v("v2"));
      assert(book.findLogs({id: id}).length == 0);
      assert(importer.findLogs({id: id}).length == 2);
    });
  });
});


describe("Book", () => {
  let book;
  beforeEach(() => {
    book = new Book();
  });

  describe("lay_append and lay_fetch", () => {
    it("should append a log", () => {
      const sobj = {};
      const eobj = {};
      book.lay_append(sobj, "foo", eobj);
      assert.deepStrictEqual(book.lay_fetch(sobj, "foo"), eobj);
    });

    context("book as sobj", () => {
      it("should append a log", () => {
        const eobj = {};
        book.lay_append(book, "foo", eobj);
        assert.deepStrictEqual(book.lay_fetch(book, "foo"), eobj);
      });
    });
  });

  describe("lay_traverse", () => {
    const sobj = {};
    const eobj = {};

    beforeEach(() => {
      book.lay_append(book, "foo", sobj);
      book.lay_append(sobj, "bar", eobj);
      book.lay_append(eobj, "buz", 1);
    });

    it("should fetch multiple keys", () => {
      assert.deepStrictEqual(book.lay_traverse(book, "foo"), sobj);
      assert.deepStrictEqual(book.lay_traverse(book, "foo", "bar"), eobj);
      assert.deepStrictEqual(book.lay_traverse(book, "foo", "bar", "buz"), 1);
    });

    context("without receiver", () => {
      it("should fetch multiple keys", () => {
        assert.deepStrictEqual(book.lay_traverse("foo"), sobj);
        assert.deepStrictEqual(book.lay_traverse("foo", "bar"), eobj);
        assert.deepStrictEqual(book.lay_traverse("foo", "bar", "buz"), 1);
      });
    });
  });

  describe("lay_put", () => {
    context("book property", () => {
      it("should append js object data", () => {
        book.lay_put({"foo": 1});
        assert.deepStrictEqual(book.lay_fetch(book, "foo"), 1);
        assert.deepStrictEqual(book.lay_traverse("foo"), 1);
      });
    });

    context("tree object", () => {
      it("should append js object data", () => {
        book.lay_put({"foo": {"bar": 1}});
        assert.deepStrictEqual(book.lay_traverse(book, "foo", "bar"), 1);
        assert.deepStrictEqual(book.lay_traverse("foo", "bar"), 1);
      });
    });
  });
});
