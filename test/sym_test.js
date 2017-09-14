import assert from 'assert';

import { v } from '../src/val';
import Book from '../src/book';
import Sym from '../src/sym';

describe("Sym", () => {
  describe("#reduce", () => {
    it("should return val of book", () => {
      const val = v("sym val");
      const book = new Book();
      book.assign("sym", val);
      assert(new Sym("sym").reduce(book) === val);
    });

    context("nested book", () => {
      it("should return val of nested book", () => {
        const val = v("sym val");
        const pbook = new Book();
        pbook.assign("sym", val);
        const book = new Book(pbook);

        assert(new Sym("sym").reduce(book) === val);
      });
    });
  });

  describe("#collate", () => {
    it("should return a matching book", () => {
      const bindings = new Sym("sym").collate(v("any"));
      assert.deepStrictEqual(bindings["it"], v("any"));
      assert.deepStrictEqual(bindings["sym"], v("any"));
    });
  });
});
