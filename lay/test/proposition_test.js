import assert from 'assert';

import UUID from '../src/uuid'
import Proposition from '../src/proposition';

describe("Proposition", () => {
  const eid = new UUID();
  const rel = new UUID();
  const val = new UUID();

  let p;
  beforeEach(() => {
    p = new Proposition(eid, rel, val);
  });
  
  describe("#hash", () => {
    it("should return sha256 urn", () => {
      assert(p.hash.match(/^urn:sha256:.*$/));
    });
  });
});
