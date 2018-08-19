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
      assert.deepStrictEqual(new LID().reducible, false);
    });
  });
});
