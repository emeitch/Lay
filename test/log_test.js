import assert from 'assert';

import UUID from '../src/uuid';
import Log, { n } from '../src/log';

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

  describe("constructor ", () => {
    it("should require a id", () => {
      assert.throws(() => new Log(), /id is required/);
    });

    it("should require a key", () => {
      assert.throws(() => new Log(id), /key is required/);
    });

    it("should constrain a val typed Val", () => {
      assert.throws(() => new Log(id, key, "unval"), /val is not a Val/);
    });
  });
});
