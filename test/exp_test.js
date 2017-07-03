import assert from 'assert';

import { v } from '../src/val';
import UUID from '../src/uuid';
import Path from '../src/path';
import Exp from '../src/exp';
import { Plus } from '../src/func';

describe("Exp", () => {
  describe("#reduce", () => {
    context("val args", () => {
      it("should reduce the expression", () => {
        const exp = new Exp(new Plus(), v(1), v(2));
        assert.deepStrictEqual(exp.reduce(), v(3));
      });
    });

    context("with ref arg", () => {
      it("should keep the expression", () => {
        const pth = new Path(new UUID(), new UUID());
        const pls = new Exp(new Plus(), pth, v(2));
        assert(pls.reduce() instanceof Exp);
      });
    });
  });
});
