import assert from 'assert';

import UUID from '../src/uuid'
import Log from '../src/log';

describe("Log", () => {
  const eid = new UUID();
  const rel = new UUID();
  const val = new UUID();

  let p;
  beforeEach(() => {
    p = new Log(eid, rel, val);
  });
  
  describe("#hash", () => {
    it("should return sha256 urn", () => {
      assert(p.hash.match(/^urn:sha256:.*$/));
    });
  });
});
