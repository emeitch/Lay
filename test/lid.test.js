import assert from 'assert';

import LID from '../src/lid';

describe("LID", () => {
  describe("#stringify", () => {
    it("should return uuid urn", () => {
      assert(new LID().stringify().match(/^lid:urn:uuid:.*$/));
    });
  });

  describe("#reducible", () => {
    it("should return true by default behavior", () => {
      const lid = new LID();
      assert.deepStrictEqual(lid.reducible, false);
    });
  });
});
