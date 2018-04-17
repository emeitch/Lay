import assert from 'assert';

import v from '../src/v';
import { exp } from '../src/exp';
import Book from '../src/book';
import { kase, alt, grd, otherwise, Native, LiftedNative } from '../src/case';
import Func, { func, plus, concat } from '../src/func';

describe("Func", () => {
  describe("func", () => {
    context("arity mismatched for native function", () => {
      it("should throw error", () => {
        assert.throws(
          () => func("x", (x, y) => x + y),
          /arity mismatched for native function/
        );

        assert.throws(
          () => func("x", "y", x => 3 * x),
          /arity mismatched for native function/
        );
      });
    });
  });

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
            func("a", "b", exp(plus, "a", "b")),
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
        assert.deepStrictEqual(reduced.alts[0].pats.length, 1);
        assert.deepStrictEqual(reduced.alts[0].grds[0].exp.terms[0], plus.alts[0].grds[0].exp);

        const e2 = exp(reduced, v(3));
        assert.deepStrictEqual(e2.reduce(), v(5));
      });
    });

    context("defined function", () => {
      it("should reduce the expression", () => {
        const book = new Book();
        book.set("f", func("y", exp(plus, v(3), "y")));

        assert.deepStrictEqual(exp("f", v(2)).reduce(book), v(5));
      });
    });

    context("variadic function", () => {
      it("should reduce the expression", () => {
        const e = exp(
          func("arg1", "arg2", (...args) => args[0] + args[1]),
          v(2),
          v(3)
        );
        assert.deepStrictEqual(e.reduce(), v(5));

        const e2 = exp(
          func((...args) => args[0] + args[1]),
          v(2),
          v(3)
        );
        assert.deepStrictEqual(e2.reduce(), v(5));
      });
    });

    context("recursive function", () => {
      it("should reduce the expression", () => {
        const book = new Book();
        book.set("f", func(
          "x",
          exp(
            kase(
              alt(
                "y",
                [
                  grd(
                    exp(
                      func("x", x => x == 0),
                      "y"
                    ),
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

    context("lexical scoping", () => {
      it("should reduce the expression", () => {
        const f = func(
          "x",
          func(
            "y",
            exp(
              plus,
              "x",
              "y"
            )
          )
        );

        const reduced = exp(f, v(3)).reduce();
        assert(reduced instanceof Func);

        assert.deepStrictEqual(exp(reduced, v(2)).reduce(), v(5));
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

    context("with infinite recursive exp", () => {
      it("should not reduce the infinite recursive exp", () => {
        const book = new Book();
        book.set("f", func(
          "x",
          exp("f", "x")
        ));
        book.set("if", func(
          "cond",
          "then",
          "else",
          exp(
            kase(
              alt(
                "x",
                [
                  grd(
                    exp(func("x", x => x), "x"),
                    "then"
                  ),
                  grd(
                    otherwise,
                    "else"
                  )
                ]
              )
            ),
            "cond"
          )
        ));

        const e = exp(
          "if",
          v(false),
          exp("f", v(0)), // infinite recursive
          v("else")
        );

        assert.deepStrictEqual(e.reduce(book), v("else"));
      });
    });

    context("arity zero func", () => {
      it("should return the reduced value", () => {
        assert.deepStrictEqual(
          exp(
            func(
              exp(
                plus,
                v(1),
                v(2)
              )
            )
          ).reduce(),
          v(3));

        assert.deepStrictEqual(
          exp(
            func(
              v(3))).reduce(),
          v(3));
      });
    });
  });

  describe("stringify", () => {
    it("should return string dump", () => {
      const n = new Native(a => a * a);
      assert(n.stringify().match(/<Native function/));

      const ln = new LiftedNative(val => val.origin * val.origin);
      assert(ln.stringify().match(/<LiftedNative function/));
    });
  });

  describe("concat", () => {
    it("should concatenate arg strings", () => {
      assert.deepStrictEqual(exp(concat, v("foo"), v("bar")).reduce(), v("foobar"));
    });
  });
});
