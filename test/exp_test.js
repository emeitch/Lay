import assert from 'assert';

import { v } from '../src/val';
import Func, { func, plus } from '../src/func';
import UUID from '../src/uuid';
import Path from '../src/path';
import Exp from '../src/exp';
import {sym} from '../src/sym';
import Case, { alt, grd, otherwise } from '../src/case';
import Book from '../src/book';

describe("Exp", () => {
  describe("#reduce", () => {
    context("val args", () => {
      it("should reduce the expression", () => {
        const exp = new Exp(
          plus,
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
          plus,
          path,
          v(2)
        );
        assert(exp.reduce() instanceof Exp);
      });
    });

    context("nested", () => {
      it("should reduce the nested expression", () => {
        const exp = new Exp(
          plus,
          v(1),
          new Exp(
            plus,
            v(2),
            v(3)
          )
        );
        assert.deepStrictEqual(exp.reduce(), v(6));
      });
    });

    context("native ftion", () => {
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
          plus,
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

    context("f literal expression", () => {
      it("should reduce the expression", () => {
        const exp = new Exp(
          func(
            sym("x"),
            sym("y"),
            new Exp(
              plus,
              sym("x"),
              sym("y")
            )
          ),
          v(2),
          v(3)
        );
        assert.deepStrictEqual(exp.reduce(), v(5));
      });
    });

    context("partial reducing f", () => {
      it("should reduce the expression", () => {
        const exp = new Exp(
          new Exp(
            func(
              sym("x"),
              sym("y"),
              new Exp(
                plus,
                sym("x"),
                sym("y")
              )
            ),
            v(2)
          ),
          v(3)
        );
        assert.deepStrictEqual(exp.reduce(), v(5));
      });
    });

    context("defined ftion", () => {
      it("should reduce the expression", () => {
        const book = new Book();
        book.assign("f", func(
          sym("y"),
          new Exp(
            plus,
            v(3),
            sym("y")
          )
        ));

        const exp = new Exp(
          sym("f"),
          v(2)
        );
        assert.deepStrictEqual(exp.reduce(book), v(5));
      });
    });

    context("recursive ftion", () => {
      it("should reduce the expression", () => {
        const book = new Book();
        book.assign("f", func(
          sym("x"),
          new Exp(
            new Case(
              alt(
                sym("y"),
                [
                  grd(
                    new Exp(
                      x => x == 0,
                      sym("y")
                    ),
                    sym("y")
                  ),
                  grd(
                    otherwise,
                    new Exp(
                      plus,
                      v(2),
                      new Exp(
                        sym("f"),
                        new Exp(
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

        const exp = new Exp(
          sym("f"),
          v(4)
        );
        assert.deepStrictEqual(exp.reduce(book), v(8));
      });
    });

    context("currying ftion", () => {
      it("should reduce the expression", () => {
        const exp = new Exp(
          new Exp(
            func(
              sym("x"),
              func(
                sym("y"),
                new Exp(
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
        assert.deepStrictEqual(exp.reduce(), v(5));
      });
    });
  });
});
