import assert from 'assert';

import Val from '../src/val';
import v from '../src/v';

describe("Val", () => {
  context("number origin", () => {
    let val;
    beforeEach(() => {
      val = v(0);
    });

    describe("#origin", () => {
      it("should return original value", () => {
        assert.deepStrictEqual(val.origin, 0);
      });
    });

    describe("#reduce", () => {
      it("should return oneself", () => {
        assert.deepStrictEqual(val.reduce(), val);
      });
    });

    describe("#toJSON", () => {
      it("should return JSON stringified original value", () => {
        assert.deepStrictEqual(val.toJSON(), "0");
      });
    });

    describe("#match", () => {
      it("should collate the original value equivalency", () => {
        assert.deepStrictEqual(v(0).match(val)["it"], v(0));
        assert(v(1).match(val) === undefined);

        const Inherited = class extends Val {};
        // same origin but different constructor
        assert(!new Inherited(0).match(val));
      });
    });

    describe("#equals", () => {
      it("should return equality for other vals", () => {
        assert(v(0).equals(v(0)));
        assert(!v(0).equals(v(1)));
      });
    });
  });
});
