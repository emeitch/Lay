import assert from 'assert';

import { v } from '../src/val';
import UUID from '../src/uuid';
import Path from '../src/path';
import Exp from '../src/exp';
import Func from '../src/func';
import { Plus } from '../src/func';
import Book from '../src/book';

describe("Exp", () => {
  describe("#reduce", () => {
    context("val args", () => {
      it("should reduce the expression", () => {
        const exp = new Exp(
          new Plus(),
          v(1),
          v(2)
        );
        const book = new Book();
        assert.deepStrictEqual(exp.reduce(book), v(3));
      });
    });

    context("with ref arg", () => {
      it("should keep the expression", () => {
        const path = new Path(new UUID(), new UUID());
        const exp = new Exp(
          new Plus(),
          path,
          v(2)
        );
        assert(exp.reduce() instanceof Exp);
      });
    });

    context("nested", () => {
      it("should reduce the nested expression", () => {
        const exp = new Exp(
          new Plus(),
          v(1),
          new Exp(
            new Plus(),
            v(2),
            v(3)
          )
        );
        assert.deepStrictEqual(exp.reduce(), v(6));
      });
    });

    context("native function", () => {
      it("should reduce the expression", () => {
        const exp = new Exp(
          (x, y) => x * y,
          v(2),
          v(3)
        );
        assert.deepStrictEqual(exp.reduce(), v(6));
      });
    });

    context("partial evaluation", () => {
      it("should reduce the expression", () => {
        const exp = new Exp(
          new Plus(),
          v(2)
        );

        const reduced = exp.reduce();
        assert(reduced instanceof Func);

        const exp2 = new Exp(
          reduced,
          v(3)
        );
        assert.deepStrictEqual(exp2.reduce(), v(5));
      });
    });
  });
});
