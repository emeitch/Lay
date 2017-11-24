import assert from 'assert';

import Hash from '../src/hash';
import Comp from '../src/comp';
import v from '../src/v';

describe("Comp", () => {
  context("complex value", () => {
    describe("#constructor", () => {
      it("should return Comp", () => {
        assert(v({a: 1, b: 2}).constructor === Comp);
        assert(v([1, 2, 3]).constructor === Comp);
      });
    });

    describe("#hash", () => {
      it("should return a hash val", () => {
        assert(v({a: 1, b: 2}).hash.equals(new Hash({a: 1, b: 2})));
        assert(v([1, 2, 3]).hash.equals(new Hash([1, 2, 3])));
      });
    });

    describe("#id", () => {
      it("should return a hash", () => {
        assert(v({a: 1, b: 2}).id.equals(new Hash({a: 1, b: 2})));
        assert(v([1, 2, 3]).id.equals(new Hash([1, 2, 3])));
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
