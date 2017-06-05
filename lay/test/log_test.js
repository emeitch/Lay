import assert from 'assert';

import UUID from '../src/uuid'
import Log from '../src/log';

describe("Log", () => {
  const oid = new UUID();
  const rel = new UUID();
  const val = new UUID();

  let log;
  beforeEach(() => {
    log = new Log(oid, rel, val);
  });
  
  describe("#hash", () => {
    it("should return sha256 urn", () => {
      assert(log.hash.match(/^urn:sha256:.*$/));
    });
  });
});
