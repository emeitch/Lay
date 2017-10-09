import assert from 'assert';

import { v } from '../src/val';
import { exp } from '../src/exp';
import Func, { func } from '../src/func';

describe("Func", () => {
  describe("create", () => {
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
  });
});
