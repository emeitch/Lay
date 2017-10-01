import assert from 'assert';

import { v } from '../src/val';
import Func, { func, plus } from '../src/func';
import UUID from '../src/uuid';
import Path from '../src/path';
import Exp, { exp } from '../src/exp';
import { sym } from '../src/sym';
import Case, { alt, grd, otherwise } from '../src/case';
import Book from '../src/book';

describe("Exp", () => {
  describe("#reduce", () => {
    context("val args", () => {
      it("should reduce the expression", () => {
        const e = exp(
          plus,
          v(1),
          v(2)
        );
        const book = new Book();
        assert.deepStrictEqual(e.reduce(book), v(3));
      });
    });

    context("with ref arg", () => {
      it("should keep the expression", () => {
        const path = new Path(new UUID(), new UUID());
        const e = exp(
          plus,
          path,
          v(2)
        );
        assert(e.reduce() instanceof Exp);
      });
    });

    context("nested", () => {
      it("should reduce the nested expression", () => {
        const e = exp(
          plus,
          v(1),
          exp(
            plus,
            v(2),
            v(3)
          )
        );
        assert.deepStrictEqual(e.reduce(), v(6));
      });
    });

    context("native function", () => {
      it("should reduce the expression", () => {
        const e = exp(
          (x, y) => x * y,
          v(2),
          v(3)
        );
        assert.deepStrictEqual(e.reduce(), v(6));
      });
    });

    context("partial evaluation", () => {
      it("should reduce the expression", () => {
        const e = exp(
          plus,
          v(2)
        );

        const reduced = e.reduce();
        assert(reduced instanceof Func);

        const e2 = exp(
          reduced,
          v(3)
        );
        assert.deepStrictEqual(e2.reduce(), v(5));
      });
    });

    context("f literal expression", () => {
      it("should reduce the expression", () => {
        const e = exp(
          func(
            sym("x"),
            sym("y"),
            exp(
              plus,
              sym("x"),
              sym("y")
            )
          ),
          v(2),
          v(3)
        );
        assert.deepStrictEqual(e.reduce(), v(5));
      });
    });

    context("partial reducing f", () => {
      it("should reduce the expression", () => {
        const e = exp(
          exp(
            func(
              sym("x"),
              sym("y"),
              exp(
                plus,
                sym("x"),
                sym("y")
              )
            ),
            v(2)
          ),
          v(3)
        );
        assert.deepStrictEqual(e.reduce(), v(5));
      });
    });

    context("defined function", () => {
      it("should reduce the expression", () => {
        const book = new Book();
        book.assign("f", func(
          sym("y"),
          exp(
            plus,
            v(3),
            sym("y")
          )
        ));

        const e = exp(
          sym("f"),
          v(2)
        );
        assert.deepStrictEqual(e.reduce(book), v(5));
      });
    });

    context("recursive function", () => {
      it("should reduce the expression", () => {
        const book = new Book();
        book.assign("f", func(
          sym("x"),
          exp(
            new Case(
              alt(
                sym("y"),
                [
                  grd(
                    exp(
                      x => x == 0,
                      sym("y")
                    ),
                    sym("y")
                  ),
                  grd(
                    otherwise,
                    exp(
                      plus,
                      v(2),
                      exp(
                        sym("f"),
                        exp(
                          plus,
                          sym("y"),
                          v(-1)
                        )
                      )
                    )
                  )
                ]
              )
            ),
            sym("x")
          )
        ));

        const e = exp(
          sym("f"),
          v(4)
        );
        assert.deepStrictEqual(e.reduce(book), v(8));
      });
    });

    context("currying function", () => {
      it("should reduce the expression", () => {
        const e = exp(
          exp(
            func(
              sym("x"),
              func(
                sym("y"),
                exp(
                  plus,
                  sym("x"),
                  sym("y")
                )
              )
            ),
            v(2)
          ),
          v(3)
        );
        assert.deepStrictEqual(e.reduce(), v(5));
      });
    });
  });
});
