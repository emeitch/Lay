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

    describe("#merge", () => {
      it("should return merged comp", () => {
        const val = v({a: 1, b: 2});
        assert.deepStrictEqual(val.merge({b: 3, c: 4}), v({a: 1, b: 3, c: 4}));
      });
    });

    describe("#set", () => {
      it("should return updated comp", () => {
        const val = v({a: 1, b: 2});
        assert.deepStrictEqual(val.set("b", v({c: 3, d: 4})), v({a: 1, b: {c: 3, d: 4}}));
      });
    });
  });

  describe("str", () => {
    it("should return string dump", () => {
      assert(v({a: [1, 2], b: "bar"}).str() === '{ a: [ 1, 2 ], b: "bar" }');
      assert(v({a: [v(1), v(2)], b: v("bar")}).str() === '{ a: [ 1, 2 ], b: "bar" }');
      assert(v("Foo", {a: [v(1), v(2)], b: v("bar")}).str() === 'Foo{ a: [ 1, 2 ], b: "bar" }');
    });
  });
});
