import assert from 'assert';

import { v } from '../src/val';
import { exp } from '../src/exp';
import Book from '../src/book';
import { kase, alt, grd, otherwise } from '../src/case';
import Func, { func, plus } from '../src/func';

describe("Func", () => {
  describe("#apply", () => {
    context("func literal expression", () => {
      it("should reduce the expression", () => {
        const e = exp(
          func("x", "y", exp(plus, "x", "y")),
          v(2),
          v(3)
        );
        assert.deepStrictEqual(e.reduce(), v(5));
      });
    });

    context("partial reduction for func literal expression", () => {
      it("should reduce the expression", () => {
        const e = exp(
          exp(
            func("x", "y", exp(plus, "x", "y")),
            v(2)
          ),
          v(3)
        );
        assert.deepStrictEqual(e.reduce(), v(5));
      });
    });

    context("partial reduction", () => {
      it("should reduce the expression", () => {
        const e = exp(plus, v(2));

        const reduced = e.reduce();
        assert(reduced instanceof Func);

        const e2 = exp(reduced, v(3));
        assert.deepStrictEqual(e2.reduce(), v(5));
      });
    });

    context("defined function", () => {
      it("should reduce the expression", () => {
        const book = new Book();
        book.assign("f", func("y", exp(plus, v(3), "y")));

        assert.deepStrictEqual(exp("f", v(2)).reduce(book), v(5));
      });
    });

    context("recursive function", () => {
      it("should reduce the expression", () => {
        const book = new Book();
        book.assign("f", func(
          "x",
          exp(
            kase(
              alt(
                "y",
                [
                  grd(
                    exp(x => x == 0, "y"),
                    "y"
                  ),
                  grd(
                    otherwise,
                    exp(
                      plus,
                      v(2),
                      exp(
                        "f",
                        exp(
                          plus,
                          "y",
                          v(-1)
                        )
                      )
                    )
                  )
                ]
              )
            ),
            "x"
          )
        ));

        assert.deepStrictEqual(exp("f", v(4)).reduce(book), v(8));
      });
    });

    context("currying function", () => {
      it("should reduce the expression", () => {
        const e = exp(
          exp(
            func(
              "x",
              func(
                "y",
                exp(plus, "x", "y")
              )
            ),
            v(2)
          ),
          v(3)
        );
        assert.deepStrictEqual(e.reduce(), v(5));
      });
    });

    context("native function exp", () => {
      it("should reduce the expression", () => {
        const e = exp(
          func("x", "y", (x, y) => x * y),
          v(2),
          v(3)
        );
        assert.deepStrictEqual(e.reduce(), v(6));
      });
    });

    context("partial reduction for native function exp", () => {
      it("should reduce the expression", () => {
        const e = exp(
          func("x", "y", (x, y) => x * y),
          v(2)
        );

        const reduced = e.reduce();
        assert(reduced instanceof Func);

        const e2 = exp(reduced, v(3));
        assert.deepStrictEqual(e2.reduce(), v(6));
      });
    });

    context("partial reduction for nested native function exp", () => {
      it("should reduce the expression", () => {
        const e = exp(
          exp(
            func("x", "y", (x, y) => x * y),
            v(2)
          ),
          v(3)
        );

        assert.deepStrictEqual(e.reduce(), v(6));
      });
    });
  });
});
