import assert from 'assert';

import { v } from '../src/val';
import { plus } from '../src/func';
import UUID from '../src/uuid';
import Path from '../src/path';
import Exp, { exp } from '../src/exp';
import Book from '../src/book';

describe("Exp", () => {
  describe("#reduce", () => {
    context("val args", () => {
      it("should reduce the expression", () => {
        const e = exp(plus, v(1), v(2));
        const book = new Book();
        assert.deepStrictEqual(e.reduce(book), v(3));
      });
    });

    context("with ref arg", () => {
      it("should keep the expression", () => {
        const path = new Path(new UUID(), new UUID());
        const e = exp(plus, path, v(2));
        assert(e.reduce() instanceof Exp);
      });
    });

    context("nested", () => {
      it("should reduce the nested expression", () => {
        const e = exp(plus, v(1), exp(plus, v(2), v(3)));
        assert.deepStrictEqual(e.reduce(), v(6));
      });
    });

    context("native function", () => {
      it("should reduce the expression", () => {
        const e = exp((x, y) => x * y, v(2), v(3));
        assert.deepStrictEqual(e.reduce(), v(6));
      });
    });
  });
});
