import assert from 'assert';

import UUID from '../src/uuid'
import Proposition from '../src/proposition';

describe("Proposition", () => {
  const id = new UUID();
  const rel = new UUID();
  const val = new UUID();

  let p;
  beforeEach(() => {
    p = new Proposition(id, rel, val);
  });
  
  describe("#id", () => {
    it("should return sha256 urn", () => {
      assert(p.hash.match(/^urn:sha256:.*$/));
    });
  });
});
