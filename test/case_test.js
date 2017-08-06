import assert from 'assert';

import { v } from '../src/val';
import Box from '../src/box';
import Sym from '../src/sym';
import Exp from '../src/exp';
import { Plus } from '../src/func';
import Case, { alt } from '../src/case';

describe("Case", () => {
  describe("#reduce", () => {
    context("unmatching", () => {
      it("should reduce the case", () => {
        const kase = new Case(v(1),
          alt(v(0), v("result"))
        );
        const env = new Box();
        assert.throws(() => kase.reduce(env), /matched pattern not found/);
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

    context("reference a matched pattern", () => {
      it("should reduce the matched result exp", () => {
        const kase = new Case(v(3),
          alt(new Sym("x"), new Exp(new Plus(), new Sym("x"), new Sym("x")))
        );
        assert.deepStrictEqual(kase.reduce(), v(6));
      });
    });
  });
});
