import assert from 'assert';

import { v } from '../src/val';
import UUID from '../src/uuid';
import Path from '../src/path';
import Exp from '../src/exp';
import { Plus } from '../src/func';
import Env from '../src/env';

describe("Exp", () => {
  describe("#reduce", () => {
    context("val args", () => {
      it("should reduce the expression", () => {
        const exp = new Exp(new Plus(), v(1), v(2));
        assert.deepStrictEqual(exp.reduce(new Env()), v(3));
      });
    });

    context("with ref arg", () => {
      it("should keep the expression", () => {
        const path = new Path(new UUID(), new UUID());
        const exp = new Exp(new Plus(), path, v(2));
        assert(exp.reduce(new Env()) instanceof Exp);
      });
    });

    context("nested", () => {
      it("should reduce the nested expression", () => {
        const exp = new Exp(new Plus(), v(1), new Exp(new Plus(), v(2), v(3)));
        assert.deepStrictEqual(exp.reduce(new Env()), v(6));
      });
    });
  });
});
