import assert from 'assert';

import v from '../src/v';
import Store from '../src/store';
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

  describe("#reduce", () => {
    it("should return val of store", () => {
      const store = new Store();
      const obj = v({
        _id: "sym",
      });
      store.put(obj);
      assert.deepStrictEqual(sym("sym").reduce(store), obj);
    });

    context("unassigned", () => {
      it("should return the sym", () => {
        const s = sym("sym");
        const store = new Store();
        assert.deepStrictEqual(s.reduce(store), s);
      });
    });

    context("nested store", () => {
      it("should return val of nested store", () => {
        const pstore = new Store();
        const obj = v({
          _id: "sym",
        });
        pstore.put(obj);
        const store = new Store(pstore);

        assert.deepStrictEqual(sym("sym").reduce(store), obj);
      });
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
