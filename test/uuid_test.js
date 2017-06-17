import assert from 'assert';

import UUID from '../src/uuid'

describe("UUID", () => {
  describe("#urn", () => {
    it("should return uuid urn", () => {
      assert(new UUID().urn.match(/^urn:uuid:.*$/));
    });
  });

  describe("#toJSON", () => {
    it("should return uuid urn", () => {
      const uuid = new UUID();
      assert(uuid.urn.match(/^urn:uuid:.*$/));
      assert.deepStrictEqual(uuid.toJSON(), uuid.urn);
    });
  });
});
