import assert from 'assert';

import v from '../src/v';
import Book from '../src/book';
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
    it("should return val of book", () => {
      const val = v("sym val");
      const store = new Store();
      store.set("sym", val);
      assert(sym("sym").reduce(store) === val);
    });

    context("multi-step refering", () => {
      it("should return val of store", () => {
        const val = v("sym val");
        const store = new Store();
        store.set("sym", sym("sym2"));
        store.set("sym2", val);
        assert(sym("sym").reduce(store) === val);
      });
    });

    context("unassigned", () => {
      it("should return the sym", () => {
        const s = sym("sym");
        const book = new Book();
        assert(s.reduce(book) === s);
      });
    });

    context("nested book", () => {
      it("should return val of nested book", () => {
        const val = v("sym val");
        const pbook = new Book();
        pbook.set("sym", val);
        const book = new Book(pbook);

        assert(sym("sym").reduce(book) === val);
      });
    });
  });

  describe("#object", () => {
    it("should return a persistent object without type", () => {
      assert.deepStrictEqual(sym("foo").object(), {origin: "foo"});
    });
  });

  describe("#collate", () => {
    it("should return a matching book", () => {
      const match = sym("sym1").collate(v("any"));
      assert.deepStrictEqual(match.result.sym1, v("any"));
    });
  });
});
