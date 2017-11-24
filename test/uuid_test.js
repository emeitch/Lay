import assert from 'assert';

import UUID from '../src/uuid';

describe("UUID", () => {
  describe("#id", () => {
    it("should return oneself", () => {
      const uuid = new UUID();
      assert.deepStrictEqual(uuid.id, uuid);
    });
  });

  describe("#toString", () => {
    it("should return uuid urn", () => {
      assert(new UUID().toString().match(/^urn:uuid:.*$/));
    });
  });

  describe("#toJSON", () => {
    it("should return uuid urn", () => {
      const uuid = new UUID();
      assert(uuid.toJSON() === uuid.toString());
    });
  });
});
