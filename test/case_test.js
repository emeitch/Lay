import assert from 'assert';

import { v } from '../src/val';
import Box from '../src/box';
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
  });
});
