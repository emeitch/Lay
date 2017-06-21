import assert from 'assert';

import LID from '../src/lid';

describe("LID", () => {
  describe("#toString", () => {
    it("should return blank node style string", () => {
      assert(new LID().toString().match(/^_:.*$/));
    });
  });

  describe("#toJSON", () => {
    it("should return same #toString", () => {
      const lid = new LID();
      assert(lid.toJSON() === lid.toString());
    });
  });
});

