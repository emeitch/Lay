import assert from 'assert';

import Prim from '../src/prim';
import Comp from '../src/comp';

import v from '../src/v';

describe("v function", () => {
  context("with primitive value origin", () => {
    it("should return a Prim", () => {
      assert.deepStrictEqual(v(0).constructor, Prim);
      assert.deepStrictEqual(v("foo").constructor, Prim);
      assert.deepStrictEqual(v(true).constructor, Prim);
    });
  });

  context("with complex value origin", () => {
    it("should return a Comp", () => {
      assert.deepStrictEqual(v({a: 1, b: 2}).constructor, Comp);
      assert.deepStrictEqual(v([1, 2, 3]).constructor, Comp);
      assert.deepStrictEqual(v(new Date()).constructor, Comp);
    });
  });

  context("with error value", () => {
    it("should throw error", () => {
      assert.throws(() => v(undefined), /not supported origin:/);
    });
  });
});
