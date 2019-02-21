import assert from 'assert';

import UUID, { uuid } from '../src/uuid';

describe("UUID", () => {
  describe("#stringify", () => {
    it("should return uuid urn", () => {
      assert(new UUID().stringify().match(/^urn:uuid:.*$/));
    });
  });

  describe("#reducible", () => {
    it("should return true by default behavior", () => {
      const u = uuid();
      assert(u.match(/^urn:uuid:.*$/));
    });
  });
});
