import assert from 'assert';

import { v } from '../src/val';
import Env from '../src/env';
import Sym from '../src/sym';

describe("Sym", () => {
  describe("#reduce", () => {
    it("should return val of env", () => {
      const val = v("sym val");
      const env = new Env(undefined, undefined, {
        "sym": val
      });
      assert(new Sym("sym").reduce(env) === val);
    });

    context("nested env", () => {
      it("should return val of nested env", () => {
        const val = v("sym val");
        const env = new Env(
          new Env(undefined, undefined, {
            "sym": val
          }), undefined);
        assert(new Sym("sym").reduce(env) === val);
      });
    });
  });
});
