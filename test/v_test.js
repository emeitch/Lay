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
      assert.deepStrictEqual(v({a: 1, b: 2}).constructor, Comp);
      assert.deepStrictEqual(v([1, 2, 3]).constructor, Comp);
      assert.deepStrictEqual(v(new Date()).constructor, Comp);
    });
  });

  context("with complex value and construcor", () => {
    it("should return a Comp", () => {
      const val = v("Foo", {a: 1, b: 2});
      assert.deepStrictEqual(val.constructor, Comp);
      assert.deepStrictEqual(val.head, sym("Foo"));
      assert.deepStrictEqual(val.fields, {a: 1, b: 2});
      assert.deepStrictEqual(val.origin, {a: 1, b: 2});
      assert.deepStrictEqual(val.get("a"), v(1));

      const val2 = v("Foo", [1, 2]);
      assert.deepStrictEqual(val2.constructor, Comp);
      assert.deepStrictEqual(val2.head, sym("Foo"));
      assert.deepStrictEqual(val2.fields, [1, 2]);
      assert.deepStrictEqual(val2.origin, [1, 2]);
      assert.deepStrictEqual(val2.get(0), v(1));
    });
  });

  context("with empty complex value as enum value", () => {
    it("should return a Sym", () => {
      const val = v("Foo", {});
      assert.deepStrictEqual(val, sym("Foo"));
      assert.deepStrictEqual(val.head, sym("Foo"));
      assert.deepStrictEqual(val.fields, null);
    });
  });

  context("with nested complex value", () => {
    it("should return a Comp", () => {
      const val = v("Foo", {a: v("Bar", {b: 1, c: 2})});
      assert.deepStrictEqual(val.constructor, Comp);
      assert.deepStrictEqual(val.head, sym("Foo"));
      assert.deepStrictEqual(val.fields, {a: v("Bar", {b: 1, c: 2})});
      assert.deepStrictEqual(val.origin, {a: v("Bar", {b: 1, c: 2})});
      assert.deepStrictEqual(val.get("a"), v("Bar", {b: 1, c: 2}));
    });
  });

  context("with error value", () => {
    it("should throw error", () => {
      assert.throws(() => v(undefined), /not supported origin:/);
    });
  });
});
