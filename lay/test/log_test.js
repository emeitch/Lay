import assert from 'assert';

import UUID from '../src/uuid'
import Log from '../src/log';

describe("Log", () => {
  const id = new UUID();
  const key = new UUID();
  const val = new UUID();

  let log;
  beforeEach(() => {
    log = new Log(id, key, val);
  });
  
  describe("#logid", () => {
    it("should return a uuid", () => {
      assert(log.logid.constructor == UUID);
    });
  });
});
