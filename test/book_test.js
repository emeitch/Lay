import assert from 'assert';

import v from '../src/v';
import UUID from '../src/uuid';
import Log from '../src/log';
import Book from '../src/book';
import Obj from '../src/obj';
import { transaction, transactionTime, invalidate } from '../src/ontology';

describe("Book", () => {
  const id = new UUID();
  const key = new UUID();
  const val = new UUID();

  let book;
  beforeEach(() => {
    book = new Book();
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
        assert(log.in === null);
        assert(book.log(log.logid) === log);
      });

      it("should append a transaction log", () => {
        const tlogs = book.findLogs({id: log.logid, key: transaction});
        assert(tlogs.length === 1);
      });

      it("should append a transaction data", () => {
        const tobj = book.transactionObj(log);
        assert(tobj.get(transactionTime).origin.constructor === Date);
      });
    });

    context("with location", () => {
      const location = new UUID();

      let log;
      beforeEach(() => {
        log = new Log(id, key, val, null, location);
        book.putLog(log);
      });

      it("should append a log with location", () => {
        assert(log.id === id);
        assert(log.key === key);
        assert(log.val === val);
        assert(log.in === location);
        assert(book.log(log.logid) === log);
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

  describe("#transactionObj", () => {
    let tobj;
    beforeEach(() => {
      const log = new Log(id, key, val);
      book.putLog(log);
      tobj = book.transactionObj(log);
    });

    it("should has no more transaction", () => {
      assert.deepStrictEqual(book.transactionObj(tobj.id), null);
    });
  });

  describe("#get", () => {
    context("name un assigned", () => {
      it("should return null", () => {
        assert.deepStrictEqual(book.get("unassigned"), null);
      });
    });

    context("name assigned", () => {
      beforeEach(() => {
        book.set("i", id);
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
        book.putLog(new Log(id, key, v("val0"), new Date(2017, 2)));
        book.putLog(new Log(id, key, v("val1")));
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

  describe("#obj", () => {
    beforeEach(() => {
      book.putLog(new Log(id, key, val));
    });

    it("should return the obj", () => {
      const o = book.obj(id);
      assert(o.constructor === Obj);
    });
  });

  describe("#new", () => {
    it("should return the obj", () => {
      const o = book.new();
      assert(o.constructor === Obj);
      assert(o.id);

      const logs = book.activeLogs(o.id, v("exists"));
      assert(logs.length > 0);
    });

    context("with properties", () => {
      it("should return the obj set properties", () => {
        const o = book.new({
          foo: 1,
          bar: "baz"
        });

        assert.deepStrictEqual(o.get("foo"), v(1));
        assert.deepStrictEqual(o.get("bar"), v("baz"));
      });
    });
  });

  describe("#objs", () => {
    it("should return new generated objs", () => {
      const o0 = book.new();
      const o1 = book.new();
      const o2 = book.new();

      const objs = book.objs();
      assert(objs.length === 3);
      assert(objs[0].id === o0.id);
      assert(objs[1].id === o1.id);
      assert(objs[2].id === o2.id);
    });
  });
});
