import assert from 'assert';

import v from '../src/v';
import Book from '../src/book';
import { sym } from '../src/sym';

describe("Sym", () => {
  describe("#reduce", () => {
    it("should return val of book", () => {
      const val = v("sym val");
      const book = new Book();
      book.set("sym", val);
      assert(sym("sym").reduce(book) === val);
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

  describe("#collate", () => {
    it("should return a matching book", () => {
      const bindings = sym("sym").collate(v("any"));
      assert.deepStrictEqual(bindings["it"], v("any"));
      assert.deepStrictEqual(bindings["sym"], v("any"));
    });
  });
});
