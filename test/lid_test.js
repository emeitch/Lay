import assert from 'assert';

import LID from '../src/lid';

describe("LID", () => {
  describe("#toString", () => {
    context("without origin", () => {
      it("should return blank node style string", () => {
        assert(new LID().toString().match(/^_:.*$/));
      });
    });

    context("with origin", () => {
      it("should return blank node style string with origin", () => {
        assert(new LID("origin").toString().match(/^_:origin$/));
      });
    });
  });

  describe("#toJSON", () => {
    it("should return same #toString", () => {
      const lid = new LID();
      assert(lid.toJSON() === lid.toString());
    });
  });
});

