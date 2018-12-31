import assert from 'assert';

import v from '../src/v';
import Sym, { sym } from '../src/sym';

describe("Sym", () => {
  describe("sym func", () => {
    it("should return sym val", () => {
      assert.deepStrictEqual(sym("foo"), new Sym("foo"));
    });

    context("arg is a sym", () => {
      it("should return arg", () => {
        assert.deepStrictEqual(sym(sym("foo")), sym("foo"));
      });
    });

    context("not string arg", () => {
      it("should return null", () => {
        assert.deepStrictEqual(sym(), null);
        assert.deepStrictEqual(sym(undefined), null);
        assert.deepStrictEqual(sym(null), null);
        assert.deepStrictEqual(sym(1), null);
        assert.deepStrictEqual(sym(true), null);
      });
    });
  });

  describe("#reducible", () => {
    it("should return false", () => {
      assert.deepStrictEqual(sym("foo").reducible, false);
    });
  });

  describe("#object", () => {
    it("should return a persistent object without type", () => {
      assert.deepStrictEqual(sym("foo").object(), {origin: "foo"});
    });
  });

  describe("#collate", () => {
    it("should return a matched", () => {
      const match = sym("sym1").collate(v("any"));
      assert.deepStrictEqual(match.result.sym1, v("any"));
    });
  });
});
