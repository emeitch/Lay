import assert from 'assert';

import UUID from '../src/uuid'
import Proposition from '../src/proposition';

describe("Proposition", () => {
  const id = new UUID();
  const rel = new UUID();
  const obj = new UUID();

  let p;
  beforeEach(() => {
    p = new Proposition(id, rel, obj);
  });
  
  describe("#id", () => {
    it("should return sha256 urn", () => {
      assert(p.hash.match(/^urn:sha256:.*$/));
    });
  });
});
