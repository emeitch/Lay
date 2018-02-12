import assert from 'assert';

import UUID from '../src/uuid';
import Log, { n } from '../src/log';
import { sym } from '../src/sym';

describe("Log", () => {
  const id = new UUID();
  const key = new UUID();
  const val = new UUID();

  let log;
  beforeEach(() => {
    log = n(id, key, val);
  });

  describe("#logid", () => {
    it("should return a uuid", () => {
      assert(log.logid.constructor === UUID);
    });
  });

  describe("constructor", () => {
    it("should require a id", () => {
      assert.throws(() => new Log(), /id is required/);
    });

    it("should require a key", () => {
      assert.throws(() => new Log(id), /key is required/);
    });

    context("js string", () => {
      const l = new Log("foo", "bar", "baz");
      assert.deepStrictEqual(l.id, sym("foo"));
      assert.deepStrictEqual(l.key, sym("bar"));
      assert.deepStrictEqual(l.val, sym("baz"));
    });
  });
});
