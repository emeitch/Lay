import assert from 'assert';

import { v } from '../src/val';
import Book from '../src/book';
import Sym from '../src/sym';

describe("Sym", () => {
  describe("#reduce", () => {
    it("should return val of env", () => {
      const val = v("sym val");
      const env = new Book();
      env.assign("sym", val);
      assert(new Sym("sym").reduce(env) === val);
    });

    context("nested env", () => {
      it("should return val of nested env", () => {
        const val = v("sym val");
        const penv = new Book();
        penv.assign("sym", val);
        const env = new Book(penv);

        assert(new Sym("sym").reduce(env) === val);
      });
    });
  });

  describe("#collate", () => {
    it("should return a matching env", () => {
      const bindings = new Sym("sym").collate(v("any"));
      assert.deepStrictEqual(bindings["it"], v("any"));
      assert.deepStrictEqual(bindings["sym"], v("any"));
    });
  });
});
