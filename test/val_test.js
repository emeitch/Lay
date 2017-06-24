import assert from "assert";

import Val from "../src/val";

describe("Val", () => {
  context("number origin", () => {
    let val;
    beforeEach(() => {
      val = new Val(0);
    });

    describe("origin", () => {
      it("should return original value", () => {
        assert.deepStrictEqual(val.origin, 0);
      });
    });
  });
});