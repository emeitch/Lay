import assert from 'assert';

import Val, { v } from '../src/val';

describe("Val", () => {
  context("number origin", () => {
    let val;
    beforeEach(() => {
      val = new Val(0);
    });

    describe("v function", () => {
      it("should suger for Val constructor", () => {
        assert.deepStrictEqual(v(0), val);
      });
    });

    describe("#origin", () => {
      it("should return original value", () => {
        assert.deepStrictEqual(val.origin, 0);
      });
    });

    describe("#toJSON", () => {
      it("should return JSON stringified original value", () => {
        assert.deepStrictEqual(val.toJSON(), "0");
      });
    });
  });
});
