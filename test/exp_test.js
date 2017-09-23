import assert from 'assert';

import { v } from '../src/val';
import UUID from '../src/uuid';
import Path from '../src/path';
import Exp from '../src/exp';
import Func from '../src/func';
import Sym from '../src/sym';
import { Plus } from '../src/func';
import Case, { alt, grd, otherwise } from '../src/case';
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

    context("func literal expression", () => {
      it("should reduce the expression", () => {
        const exp = new Exp(
          new Func(
            new Sym("x"),
            new Sym("y"),
            new Exp(
              new Plus(),
              new Sym("x"),
              new Sym("y")
            )
          ),
          v(2),
          v(3)
        );
        assert.deepStrictEqual(exp.reduce(), v(5));
      });
    });

    context("partial reducing func", () => {
      it("should reduce the expression", () => {
        const exp = new Exp(
          new Exp(
            new Func(
              new Sym("x"),
              new Sym("y"),
              new Exp(
                new Plus(),
                new Sym("x"),
                new Sym("y")
              )
            ),
            v(2)
          ),
          v(3)
        );
        assert.deepStrictEqual(exp.reduce(), v(5));
      });
    });

    context("defined function", () => {
      it("should reduce the expression", () => {
        const book = new Book();
        book.assign("f", new Func(
          new Sym("y"),
          new Exp(
            new Plus(),
            v(3),
            new Sym("y")
          )
        ));

        const exp = new Exp(
          new Sym("f"),
          v(2)
        );
        assert.deepStrictEqual(exp.reduce(book), v(5));
      });
    });

    context("recursive function", () => {
      it("should reduce the expression", () => {
        const book = new Book();
        book.assign("f", new Func(
          new Sym("x"),
          new Case(new Sym("x"),
            alt(
              new Sym("y"),
              grd(
                new Exp(
                  x => x == 0,
                  new Sym("y")
                ),
                new Sym("y")
              ),
              grd(
                otherwise,
                new Exp(
                  new Plus(),
                  v(2),
                  new Exp(
                    new Sym("f"),
                    new Exp(
                      new Plus(),
                      new Sym("y"),
                      v(-1)
                    )
                  )
                )
              )
            )
          )
        ));

        const exp = new Exp(
          new Sym("f"),
          v(4)
        );
        assert.deepStrictEqual(exp.reduce(book), v(8));
      });
    });
  });
});
