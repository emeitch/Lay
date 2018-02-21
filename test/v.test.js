import assert from 'assert';

import Prim from '../src/prim';
import Comp from '../src/comp';
import { sym } from '../src/sym';

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
      assert(v(new Date()) instanceof Comp);
    });
  });

  context("with complex value and construcor", () => {
    it("should return a Comp", () => {
      const val = v("Foo", {a: 1, b: 2});
      assert(val instanceof Comp);
      assert.deepStrictEqual(val.head, sym("Foo"));
      assert.deepStrictEqual(val.fields, {a: 1, b: 2});
      assert.deepStrictEqual(val.origin, {a: 1, b: 2});
      assert.deepStrictEqual(val.get("a"), v(1));

      const val2 = v("Foo", [1, 2]);
      assert(val2 instanceof Comp);
      assert.deepStrictEqual(val2.head, sym("Foo"));
      assert.deepStrictEqual(val2.fields, [1, 2]);
      assert.deepStrictEqual(val2.origin, [1, 2]);
      assert.deepStrictEqual(val2.get(0), v(1));
    });
  });

  context("with empty complex value as enum value", () => {
    it("should return a empty Comp", () => {
      const val = v("Foo", {});
      assert.deepStrictEqual(val.head, sym("Foo"));
      assert.deepStrictEqual(val.fields, {});
    });
  });

  context("with premitive complex value", () => {
    it("should return a empty Comp", () => {
      const val = v("Foo", 1);
      assert.deepStrictEqual(val, new Comp(1, sym("Foo")));
      assert.deepStrictEqual(val.head, sym("Foo"));
      assert.deepStrictEqual(val.fields, 1);
    });
  });

  context("with nested complex value", () => {
    it("should return a Comp", () => {
      const val = v("Foo", {a: v("Bar", {b: 1, c: 2})});
      assert(val instanceof Comp);
      assert.deepStrictEqual(val.head, sym("Foo"));
      assert.deepStrictEqual(val.fields, {a: v("Bar", {b: 1, c: 2})});
      assert.deepStrictEqual(val.origin, {a: v("Bar", {b: 1, c: 2})});
      assert.deepStrictEqual(val.get("a"), v("Bar", {b: 1, c: 2}));
    });
  });

  context("with literal prototype complex value", () => {
    it("should return a Comp", () => {
      const val = v(v(v({a: 1}), {b: 2}), {c: 3});
      assert.deepStrictEqual(val.head, v(v({a: 1}), {b: 2}));
      assert.deepStrictEqual(val.get("a"), v(1));
      assert.deepStrictEqual(val.get("b"), v(2));
      assert.deepStrictEqual(val.get("c"), v(3));
    });
  });

  context("with Prim item complex value", () => {
    it("should return a Comp with Prim origin", () => {
      assert.deepStrictEqual(v([v(1), v(2)]), v([1, 2]));
      assert.deepStrictEqual(v({a: v(1), b: v(2)}), v({a: 1, b: 2}));
    });
  });

  context("with error value", () => {
    it("should throw error", () => {
      assert.throws(() => v(undefined), /not supported origin:/);
    });
  });
});
