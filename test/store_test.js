import assert from 'assert';

import Val from '../src/val';
import UUID from '../src/uuid';
import Store from '../src/store';
import Obj from '../src/obj';
import { transaction, transactionTime, invalidate } from '../src/ontology';

describe("Store", () => {
  const id = new UUID();
  const key = new UUID();
  const val = new UUID();

  let store;
  beforeEach(() => {
    store = new Store();
  });

  describe("#log", () => {
    context("standard arguments", () => {
      let log;
      beforeEach(() => {
        log = store.log(id, key, val);
      });

      it("should append a log", () => {
        assert(log.id === id);
        assert(log.key === key);
        assert(log.val === val);
        assert(log.in === undefined);
        assert(store.getLog(log.logid) === log);
      });

      it("should append a transaction log", () => {
        const tlogs = store.findLogs({id: log.logid, key: transaction});
        assert(tlogs.length === 1);
      });

      it("should append a transaction data", () => {
        const tobj = store.transactionObj(log);
        assert(tobj.get(transactionTime).origin.constructor === Date);
      });
    });

    context("with location", () => {
      const location = new UUID();

      let log;
      beforeEach(() => {
        log = store.log(id, key, val, undefined, location);
      });

      it("should append a log with location", () => {
        assert(log.id === id);
        assert(log.key === key);
        assert(log.val === val);
        assert(log.in === location);
        assert(store.getLog(log.logid) === log);
      });
    });

    context("with time", () => {
      const time = new Date(2017, 0);

      let log;
      beforeEach(() => {
        log = store.log(id, key, val, time);
      });

      it("should append a log with time", () => {
        assert(log.id === id);
        assert(log.key === key);
        assert(log.val === val);
        assert(log.at === time);
        assert(store.getLog(log.logid) === log);
      });
    });
  });

  describe("#transactionObj", () => {
    let tobj;
    beforeEach(() => {
      const log = store.log(id, key, val);
      tobj = store.transactionObj(log);
    });

    it("should has no more transaction", () => {
      assert(store.transactionObj(tobj.id) === undefined);
    });
  });

  describe("#ref", () => {
    context("name un assigned", () => {
      it("should return undefined", () => {
        assert(store.ref("unassigned") === undefined);
      })
    });

    context("name assigned", () => {
      beforeEach(() => {
        store.assign("i", id);
        store.assign("k", key);
        store.assign("v", val);
      });

      it("should return a id by name", () => {
        assert(store.ref("i") === id);
        assert(store.ref("k") === key);
        assert(store.ref("v") === val);
      });

      context("name re-assigned", () => {
        const key2 = new UUID();

        beforeEach(() => {
          store.assign("r", key2);
        });

        it("should return a re-assigned id by name", () => {
          assert(store.ref("r") === key2);
        });
      });
    });
  });

  describe("#activeLogs", () => {
    context("no logs", () => {
      it("should return empty", () => {
        const logs = store.activeLogs(id, key);
        assert(logs.length === 0);
      });
    });

    context("logs with same ids & keys but different vals", () => {
      beforeEach(() => {
        store.log(id, key, new Val("val0"));
        store.log(id, key, new Val("val1"));
      });

      it("should return all logs", () => {
        const logs = store.activeLogs(id, key);
        assert.deepStrictEqual(logs[0].val, new Val("val0"));
        assert.deepStrictEqual(logs[1].val, new Val("val1"));
      });

      context("invalidate the last log", () => {
        beforeEach(() => {
          const log = store.activeLog(id, key);
          store.log(log.logid, invalidate);
        });

        it("should return only the first log", () => {
          const logs = store.activeLogs(id, key);
          assert.deepStrictEqual(logs[0].val, new Val("val0"));
          assert.deepStrictEqual(logs[1], undefined);
        });
      });
    });

    context("logs with applying time", () => {
      beforeEach(() => {
        store.log(id, key, new Val("val0"), new Date(2017, 0));
        store.log(id, key, new Val("val1"), new Date(2017, 2));
      });

      it("should return all logs", () => {
        const logs = store.activeLogs(id, key);
        assert.deepStrictEqual(logs[0].val, new Val("val0"));
        assert.deepStrictEqual(logs[1].val, new Val("val1"));
      });

      it("should return only the first log by specifying time before applied", () => {
        const logs = store.activeLogs(id, key, new Date(2017, 1));
        assert.deepStrictEqual(logs[0].val, new Val("val0"));
        assert.deepStrictEqual(logs[1], undefined);
      });

      context("invalidate the last log", () => {
        beforeEach(() => {
          const log = store.activeLog(id, key);
          store.log(log.logid, invalidate);
        });

        it("should return only the first log", () => {
          const logs = store.activeLogs(id, key);
          assert.deepStrictEqual(logs[0].val, new Val("val0"));
          assert.deepStrictEqual(logs[1], undefined);
        });
      });

      context("invalidate the last log with applying time", () => {
        beforeEach(() => {
          const log = store.activeLog(id, key);
          store.log(log.logid, invalidate, undefined, new Date(2017, 4));
        });

        it("should return only the first log", () => {
          const logs = store.activeLogs(id, key, new Date(2017, 6));
          assert.deepStrictEqual(logs[0].val, new Val("val0"));
          assert.deepStrictEqual(logs[1], undefined);
        });

        it("should return only the first log by time specified just invalidation time", () => {
          const logs = store.activeLogs(id, key, new Date(2017, 4));
          assert.deepStrictEqual(logs[0].val, new Val("val0"));
          assert.deepStrictEqual(logs[1], undefined);
        });

        it("should return all logs by time specified before invalidation", () => {
          const logs = store.activeLogs(id, key, new Date(2017, 3));
          assert.deepStrictEqual(logs[0].val, new Val("val0"));
          assert.deepStrictEqual(logs[1].val, new Val("val1"));
        });
      });
    });

    context("log with old applying time", () => {
      beforeEach(() => {
        store.log(id, key, new Val("val0"), new Date(2017, 1));
        store.log(id, key, new Val("val1"), new Date(2017, 0));
      });

      it("should return all logs order by applying time", () => {
        const logs = store.activeLogs(id, key);
        assert.deepStrictEqual(logs[0].val, new Val("val1"));
        assert.deepStrictEqual(logs[1].val, new Val("val0"));
      });

      context("invalidate the last log", () => {
        beforeEach(() => {
          const log = store.activeLog(id, key);
          store.log(log.logid, invalidate);
        });

        it("should return only the first log", () => {
          const logs = store.activeLogs(id, key);
          assert.deepStrictEqual(logs[0].val, new Val("val1"));
          assert.deepStrictEqual(logs[1], undefined);
        });
      });
    });

    context("contain a log with time and a log without time", () => {
      beforeEach(() => {
        store.log(id, key, new Val("val0"), new Date(2017, 2));
        store.log(id, key, new Val("val1"));
      });

      it("should return all logs order by applying time", () => {
        const logs = store.activeLogs(id, key);
        assert.deepStrictEqual(logs[0].val, new Val("val1"));
        assert.deepStrictEqual(logs[1].val, new Val("val0"));
      });
    });
  });

  describe("#activeLog", () => {
    context("no logs", () => {
      it("should return undefined", () => {
        const log = store.activeLog(id, key);
        assert.deepStrictEqual(log, undefined);
      });
    });

    context("logs with applying time", () => {
      beforeEach(() => {
        store.log(id, key, new Val("val0"), new Date(2017, 0));
        store.log(id, key, new Val("val1"), new Date(2017, 2));
      });

      it("should return the last log", () => {
        const log = store.activeLog(id, key);
        assert.deepStrictEqual(log.val, new Val("val1"));
      });

      it("should return the first log by specifying time", () => {
        const log = store.activeLog(id, key, new Date(2017, 1));
        assert.deepStrictEqual(log.val, new Val("val0"));
      });
    });
  });

  describe("#obj", () => {
    beforeEach(() => {
      store.log(id, key, val);
    });

    it("should return the object", () => {
      const o = store.obj(id);
      assert(o.constructor === Obj);
    });
  });
});
