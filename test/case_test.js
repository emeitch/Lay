import assert from 'assert';

import { v } from '../src/val';
import Book from '../src/book';
import { exp } from '../src/exp';
import { kase, alt, grd, otherwise, kfunc } from '../src/case';

describe("Case", () => {
  describe("#reduce", () => {
    context("unmatching", () => {
      it("should reduce the case", () => {
        const e = exp(
          kase(
            alt(v(0), v("result"))
          ),
          v(1)
        );
        const book = new Book();
        assert.throws(() => e.reduce(book), /matched pattern not found/);
      });
    });

    context("matching val pattern", () => {
      it("should reduce the matched result exp", () => {
        const e = exp(
          kase(
            alt(v(1), v("result"))
          ),
          v(1)
        );
        assert.deepStrictEqual(e.reduce(), v("result"));
      });
    });

    context("multi patterns", () => {
      it("should reduce the matched result exp", () => {
        const e = exp(
          kase(
            alt(v(1), v("result1")),
            alt(v(2), v("result2")),
            alt(v(3), v("result3"))
          ),
          v(3)
        );
        assert.deepStrictEqual(e.reduce(), v("result3"));
      });
    });

    context("exp value", () => {
      it("should reduce the exp value", () => {
        const e = exp(
          kase(
            alt(
              v(3),
              exp(
                kfunc("x", "y", (x, y) => x * y),
                v(4),
                v(5)
              )
            )
          ),
          v(3)
        );
        assert.deepStrictEqual(e.reduce(), v(20));
      });
    });

    context("reference a matched pattern", () => {
      it("should reduce the matched result exp", () => {
        const e = exp(
          kase(
            alt(
              "x",
              exp(
                kfunc("x", "y", (x, y) => x * y),
                "x",
                "x"
              )
            )
          ),
          v(3)
        );
        assert.deepStrictEqual(e.reduce(), v(9));
      });
    });

    context("with guards", () => {
      it("should reduce the matched guard result exp", () => {
        const a = alt(
          "x",
          [
            grd(
              exp(
                kfunc("y", y => y < 5),
                "x"
              ),
              v(5)
            ),
            grd(
              exp(
                kfunc("y", y => y >= 5),
                "x"
              ),
              v(10)
            )
          ]
        );

        const r1 = exp(kase(a), v(3)).reduce();
        assert.deepStrictEqual(r1, v(5));

        const r2 = exp(kase(a), v(8)).reduce();
        assert.deepStrictEqual(r2, v(10));
      });
    });

    context("with otherwise", () => {
      it("should reduce the otherwise guard result exp", () => {
        const a = alt(
          "x",
          [
            grd(
              exp(
                kfunc("y", y => y < 5),
                "x"
              ),
              v(5)
            ),
            grd(
              otherwise,
              v(10)
            )
          ]
        );

        const r1 = exp(kase(a), v(3)).reduce();
        assert.deepStrictEqual(r1, v(5));

        const r2 = exp(kase(a), v(8)).reduce();
        assert.deepStrictEqual(r2, v(10));
      });
    });

    context("multiple patterns", () => {
      it("should reduce the matched result exp", () => {
        const a = alt(
          "x",
          "y",
          "z",
          [
            grd(
              exp(
                kfunc("x", "y", "z", (x, y, z) => x == y && y == z),
                "x",
                "y",
                "z"
              ),
              v(5)
            ),
            grd(
              otherwise,
              v(10)
            )
          ]
        );

        const r1 = exp(kase(a), v(3), v(3), v(3)).reduce();
        assert.deepStrictEqual(r1, v(5));

        const r2 = exp(kase(a), v(3), v(4), v(5)).reduce();
        assert.deepStrictEqual(r2, v(10));
      });
    });
  });
});
