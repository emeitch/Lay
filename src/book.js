import _ from 'lodash';
import Val from './val';
import v from './v';
import UUID from './uuid';
import Log from './log';
import Comp from './comp';
import Act from './act';
import { sym } from './sym';
import { assign, transaction, transactionTime, invalidate } from './ontology';

export default class Book {
  constructor(...imports) {
    this.logs = new Map();
    this.activeLogsCache = new Map();
    this.invalidationLogsCache = new Map();
    this.imports = [];
    for (const i of imports) {
      this.import(i);
    }
  }

  log(logid) {
    return this.logs.get(logid);
  }

  findLogs(condition) {
    const cond = {};
    Object.keys(condition).forEach(k => {
      if (typeof(condition[k]) === "string") {
        cond[k] = sym(condition[k]);
      } else {
        cond[k] = condition[k];
      }
    });

    let logs = [];
    for (const imported of this.imports) {
      const ls = imported.findLogs(cond);
      if (ls.length > 0) {
        logs = logs.concat(ls);
      }
    }

    // todo: 線形探索になっているので高速化する
    for (const [, log] of this.logs) {
      const keys = Object.keys(cond);
      if (keys.every((k) => Val.stringify(log[k]) === Val.stringify(cond[k]))) {
        logs.push(log);
      }
    }

    return logs;
  }

  cacheIndex(id, key) {
    key = typeof(key) === "string" ? sym(key) : v(key);
    return Val.stringify(id) + "__" + Val.stringify(key);
  }

  findActiveLogs(cond) {
    const logs = [];
    for (const log of this.findLogs(cond)) {
      const i = this.cacheIndex(log.id, log.key);
      const ilogs = new Map(this.invalidationLogsCache.get(i));

      let invalidated = false;
      for (let [, ilog] of ilogs) {
        if (ilog.id.equals(log.logid)) {
          invalidated = true;
          break;
        }
      }

      if (!invalidated) {
        logs.push(log);
      }
    }

    return logs;
  }

  activeLogs(id, key, at=new Date()) {
    const i = this.cacheIndex(id, key);
    const alogs = new Map(this.activeLogsCache.get(i));
    const ilogs = new Map(this.invalidationLogsCache.get(i));

    for (let [, log] of alogs) {
      if (log.at && log.at > at) {
        alogs.delete(log.logid);
      }
    }

    for (let [, ilog] of ilogs) {
      const log = alogs.get(ilog.id);
      if (log && (!ilog.at || ilog.at <= at)) {
        alogs.delete(log.logid);
      }
    }

    const actives = Array.from(alogs.values()).sort((a, b) => {
      // todo: atが重複した場合に順序が制御されないのをどうにかする
      return a.at.getTime() - b.at.getTime();
    });

    if (actives.length > 0) {
      return actives;
    }

    for (const imported of this.imports) {
      const logs = imported.activeLogs(id, key, at);
      if (logs.length > 0) {
        return logs;
      }
    }

    return [];
  }

  activeLog(id, key, at=new Date()) {
    const actives = this.activeLogs(id, key, at);
    return actives[actives.length-1];
  }

  findLogWithTags(id, key) {
    const log = this.activeLog(id, key);
    if (log) {
      return log;
    }

    const pattern = sym("self");
    const target = id;
    const result = {self: id};
    const match = {pattern, target, result};
    const matches = [match];

    const tlogs = this.activeLogs(id, "tag");
    for (const tlog of tlogs) {
      const p = tlog.val.replace(matches).reduce(this);
      const l = this.findLogWithTags(p, key);
      if (l) {
        return l;
      }
    }

    const olog = this.activeLog(this.get("Object"), key);
    if (olog) {
      return olog;
    }

    const rawlog = this.log(id);
    if (rawlog && rawlog[key]) {
      // todo: アドホックなログとしてlogidが存在しないなど特殊な扱いにしたい
      return new Log(id, key, rawlog[key]);
    }

    return undefined;
  }

  handleOnInport(other) {
    const actexp = other.get("onImport");
    if (actexp) {
      const act = actexp.reduce(this);
      this.run(act);
    }
  }

  import(other) {
    this.imports.push(other);
    this.handleOnInport(other);
  }

  new(props) {
    const id = new UUID();

    if (props) {
      for (const key of Object.keys(props)) {
        const val = props[key];
        this.put(id, key, val);
      }
    }

    this.put(id, "exists", v(true));

    return id;
  }

  existsIDs() {
    const logs = this.findLogs({key: sym("exists")});
    const ids = _.uniq(logs.map(l => l.id));
    return ids;
  }

  transactionID(log) {
    const tlogs = this.findLogs({id: log.logid, key: transaction});

    if (tlogs.length === 0) {
      return null;
    }

    const tlog = tlogs[0];
    const tid = tlog.val;
    return tid;
  }

  get(name) {
    const logs = this.findLogs({id: sym(name), key: assign});
    const log = logs[logs.length-1];
    if (log) {
      return log.val;
    }

    return undefined;
  }

  set(name, id) {
    // todo: ユニーク制約をかけたい
    const log = new Log(sym(name), assign, id);
    this.putLog(log);
  }

  name(id) {
    const logs = this.findActiveLogs({key: assign, val: id});
    return logs.length > 0 ? logs[0].id : v(null);
  }

  syncCache(log) {
    const i = this.cacheIndex(log.id, log.key);
    const al = this.activeLogsCache.get(i) || new Map();
    al.set(log.logid, log);
    this.activeLogsCache.set(i, al);

    if (log.key === invalidate) {
      const positive = this.log(log.id);
      const i = this.cacheIndex(positive.id, positive.key);
      const il = this.invalidationLogsCache.get(i) || new Map();
      il.set(log.logid, log);
      this.invalidationLogsCache.set(i, il);
    }
  }

  doTransaction(block) {
    // todo: アトミックな操作に修正する
    const appendLog = (log) => {
      this.logs.set(log.logid, log);
      this.syncCache(log);
    };
    const tid = new UUID();
    const ttlog = new Log(tid, transactionTime, v(new Date()));

    appendLog(ttlog);

    const putWithTransaction = (log) => {
      appendLog(log);
      const tlog = new Log(log.logid, transaction, tid);
      appendLog(tlog);
      return log;
    };
    return block(putWithTransaction);
  }

  doPutLog(log) {
    return this.doTransaction(putWithTransaction => {
      return putWithTransaction(log);
    });
  }

  handleOnPut(log) {
    const alogs = this.findActiveLogs({id: "onPut"});
    for (const alog of alogs) {
      const actexp = alog.val;
      const act = actexp.reduce(this);
      this.run(act, log);
    }
  }

  putLog(log) {
    const result = this.doPutLog(log);
    this.handleOnPut(log);
    return result;
  }

  put(...args) {
    const log = new Log(...args);
    return this.putLog(log);
  }

  putAct(...args) {
    return new Act(() => {
      return this.put(...args);
    });
  }

  taggedIDs(id) {
    const name = this.name(id);
    if (name.origin === null) {
      return [];
    }
    const sname = sym(name.origin);
    const logs = this.findActiveLogs({key: "tag", val: sname});
    return logs.filter(log => {
      const es = this.findActiveLogs({id: log.id, key: "exists"});
      return es.length > 0 && es[es.length-1].val.origin;
    }).map(log => log.id);
  }

  run(e, arg) {
    let acts = e.deepReduce(this);
    if (acts instanceof Act) {
      acts = v([acts]);
    }

    let act = null;
    if (acts instanceof Comp && Array.isArray(acts.origin)) {
      for (act of acts.origin) {
        if (!(act instanceof Act)) {
          throw `not Act instance: ${act}`;
        }

        do {
          act = act.proceed(arg);
        } while(act.next);
      }
    }

    return act ? act.val : null;
  }

  logIDs() {
    const logids = [];
    for (const [, log] of this.logs) {
      logids.push(log.logid);
    }

    return logids.concat(this.imports.reduce((r, i) => r.concat(i.logIDs()), []));
  }
}
