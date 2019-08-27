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
      assert.deepStrictEqual(v(null).constructor, Prim);
    });
  });

  context("with complex value origin", () => {
    it("should return a Comp", () => {
      assert(v({a: 1, b: 2}) instanceof Comp);
      assert(v([1, 2, 3]) instanceof Comp);

      const date = v(new Date());
      assert(date instanceof Comp);
      assert(date.get("_type"), v("Date"));
    });
  });

  context("with complex value and constructor", () => {
    it("should return a Comp", () => {
      const val = v("Foo", {a: 1, b: 2});
      assert(val instanceof Comp);
      assert.deepStrictEqual(val.get("_type"), v("Foo"));
      assert.deepStrictEqual(val.origin, {_type: v("Foo"), a: 1, b: 2});
      assert.deepStrictEqual(val.get("a"), v(1));
    });
  });

  context("with empty complex value as enum value", () => {
    it("should return a empty Comp", () => {
      const val = v("Foo", {});
      assert.deepStrictEqual(val.get("_type"), v("Foo"));
      assert.deepStrictEqual(val.origin, {_type: v("Foo")});
    });
  });

  context("with nested complex value", () => {
    it("should return a Comp", () => {
      const val = v("Foo", {a: v("Bar", {b: 1, c: 2})});
      assert(val instanceof Comp);
      assert.deepStrictEqual(val.get("_type"), v("Foo"));
      assert.deepStrictEqual(val.origin, {_type: v("Foo"), a: v("Bar", {b: 1, c: 2})});
      assert.deepStrictEqual(val.get("a"), v("Bar", {b: 1, c: 2}));
    });
  });

  context("with Prim item complex value", () => {
    it("should return a Comp with Prim origin", () => {
      assert.deepStrictEqual(v([v(1), v(2)]), v([1, 2]));
      assert.deepStrictEqual(v({a: v(1), b: v(2)}), v({a: 1, b: 2}));
    });
  });

  context("with not supported origin and type", () => {
    it("should throw error", () => {
      assert.throws(() => v("Foo", 3), /not supported origin:.* type:.*/);
      assert.throws(() => v("Foo", v(3)), /not supported origin:.* type:.*/);
    });
  });

  context("with error value", () => {
    it("should throw error", () => {
      assert.throws(() => v(undefined), /not supported origin:/);
    });
  });
});
