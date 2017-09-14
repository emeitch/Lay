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
        const kase = new Case(v(1),
          alt(v(0), v("result"))
        );
        const book = new Book();
        assert.throws(() => kase.reduce(book), /matched pattern not found/);
      });
    });

    context("matching val pattern", () => {
      it("should reduce the matched result exp", () => {
        const kase = new Case(v(1),
          alt(v(1), v("result"))
        );
        assert.deepStrictEqual(kase.reduce(), v("result"));
      });
    });

    context("multi patterns", () => {
      it("should reduce the matched result exp", () => {
        const kase = new Case(v(3),
          alt(v(1), v("result1")),
          alt(v(2), v("result2")),
          alt(v(3), v("result3"))
        );
        assert.deepStrictEqual(kase.reduce(), v("result3"));
      });
    });

    context("exp value", () => {
      it("should reduce the exp value", () => {
        const kase = new Case(v(3),
          alt(
            v(3),
            new Exp(
              new Plus(),
              v(1),
              v(3)
            )
          )
        );
        assert.deepStrictEqual(kase.reduce(), v(4));
      });
    });

    context("reference a matched pattern", () => {
      it("should reduce the matched result exp", () => {
        const kase = new Case(v(3),
          alt(
            new Sym("x"),
            new Exp(
              new Plus(),
              new Sym("x"),
              new Sym("x")
            )
          )
        );
        assert.deepStrictEqual(kase.reduce(), v(6));
      });
    });

    context("with guards", () => {
      it("should reduce the matched guard result exp", () => {
        const a = alt(
          new Sym("x"),
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
        );
        assert.deepStrictEqual(new Case(v(3), a).reduce(), v(5));
        assert.deepStrictEqual(new Case(v(8), a).reduce(), v(10));
      });
    });

    context("with otherwise", () => {
      it("should reduce the otherwise guard result exp", () => {
        const a = alt(
          new Sym("x"),
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
        );
        assert.deepStrictEqual(new Case(v(3), a).reduce(), v(5));
        assert.deepStrictEqual(new Case(v(8), a).reduce(), v(10));
      });
    });
  });
});
