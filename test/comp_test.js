import assert from 'assert';

import Hash from '../src/hash';
import v from '../src/v';

describe("Comp", () => {
  context("complex value", () => {
    describe("#hash", () => {
      it("should return a hash val", () => {
        assert.deepStrictEqual(v({a: 1, b: 2}).hash, new Hash({a: 1, b: 2}));
        assert.deepStrictEqual(v([1, 2, 3]).hash, new Hash([1, 2, 3]));
      });
    });

    describe("#id", () => {
      it("should return a hash", () => {
        assert.deepStrictEqual(v({a: 1, b: 2}).id, new Hash({a: 1, b: 2}));
        assert.deepStrictEqual(v([1, 2, 3]).id, new Hash([1, 2, 3]));
      });
    });

    describe("#reducible", () => {
      it("should return false", () => {
        assert.deepStrictEqual(v({a: 1, b: 2}).reducible, false);
        assert.deepStrictEqual(v([1, 2, 3]).reducible, false);
      });
    });
  });
});
