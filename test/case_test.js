import assert from 'assert';

import { v } from '../src/val';
import Book from '../src/book';
import Sym from '../src/sym';
import Exp from '../src/exp';
import { Plus } from '../src/func';
import Case, { alt, grd, otherwise } from '../src/case';

describe("Case", () => {
  describe("#reduce", () => {
    context("unmatching", () => {
      it("should reduce the case", () => {
        const exp = new Exp(
          new Case(
            alt(v(0), v("result"))
          ),
          v(1)
        );
        const book = new Book();
        assert.throws(() => exp.reduce(book), /matched pattern not found/);
      });
    });

    context("matching val pattern", () => {
      it("should reduce the matched result exp", () => {
        const exp = new Exp(
          new Case(
            alt(v(1), v("result"))
          ),
          v(1)
        );
        assert.deepStrictEqual(exp.reduce(), v("result"));
      });
    });

    context("multi patterns", () => {
      it("should reduce the matched result exp", () => {
        const exp = new Exp(
          new Case(
            alt(v(1), v("result1")),
            alt(v(2), v("result2")),
            alt(v(3), v("result3"))
          ),
          v(3)
        );
        assert.deepStrictEqual(exp.reduce(), v("result3"));
      });
    });

    context("exp value", () => {
      it("should reduce the exp value", () => {
        const exp = new Exp(
          new Case(
            alt(
              v(3),
              new Exp(
                new Plus(),
                v(1),
                v(3)
              )
            )
          ),
          v(3)
        );
        assert.deepStrictEqual(exp.reduce(), v(4));
      });
    });

    context("reference a matched pattern", () => {
      it("should reduce the matched result exp", () => {
        const exp = new Exp(
          new Case(
            alt(
              new Sym("x"),
              new Exp(
                new Plus(),
                new Sym("x"),
                new Sym("x")
              )
            )
          ),
          v(3)
        );
        assert.deepStrictEqual(exp.reduce(), v(6));
      });
    });

    context("with guards", () => {
      it("should reduce the matched guard result exp", () => {
        const a = alt(
          new Sym("x"),
          [
            grd(
              new Exp(
                x => x < 5,
                new Sym("x")
              ),
              v(5)
            ),
            grd(
              new Exp(
                x => x >= 5 ,
                new Sym("x")
              ),
              v(10)
            )
          ]
        );
        assert.deepStrictEqual(
          new Exp(
            new Case(a),
            v(3)
          ).reduce(),
          v(5)
        );
        assert.deepStrictEqual(
          new Exp(
            new Case(a),
            v(8)
          ).reduce(),
          v(10)
        );
      });
    });

    context("with otherwise", () => {
      it("should reduce the otherwise guard result exp", () => {
        const a = alt(
          new Sym("x"),
          [
            grd(
              new Exp(
                x => x < 5,
                new Sym("x")
              ),
              v(5)
            ),
            grd(
              otherwise,
              v(10)
            )
          ]
        );
        assert.deepStrictEqual(
          new Exp(
            new Case(a),
            v(3)
          ).reduce(),
          v(5)
        );
        assert.deepStrictEqual(
          new Exp(
            new Case(a),
            v(8)
          ).reduce(),
          v(10)
        );
      });
    });

    context("multiple patterns", () => {
      it("should reduce the matched result exp", () => {
        const a = alt(
          new Sym("x"),
          new Sym("y"),
          new Sym("z"),
          [
            grd(
              new Exp(
                (x, y, z) => x == y && y == z,
                new Sym("x"),
                new Sym("y"),
                new Sym("z")
              ),
              v(5)
            ),
            grd(
              otherwise,
              v(10)
            )
          ]
        );

        assert.deepStrictEqual(
          new Exp(
            new Case(a),
            v(3),
            v(3),
            v(3)
          ).reduce(),
          v(5)
        );
        assert.deepStrictEqual(
          new Exp(
            new Case(a),
            v(3),
            v(4),
            v(5)
          ).reduce(),
          v(10)
        );
      });
    });
  });
});
