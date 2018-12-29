import assert from 'assert';

import v from '../src/v';
import { plus } from '../src/func';
import UUID from '../src/uuid';
import Path from '../src/path';
import { exp } from '../src/exp';
import Store from '../src/store';
import { path } from '../src/path';

describe("Exp", () => {
  describe("#step", () => {
    context("simple", () => {
      it("should evalutate one step the expression", () => {
        const e = exp(plus, v(1), v(2));
        const store = new Store();

        const e2 = e.step(store);
        const native = plus.exp;
        assert.deepStrictEqual(e2, exp(native, v(1), v(2)));

        const e3 = e2.step(store);
        assert.deepStrictEqual(e3, v(3));
      });
    });

    context("nested", () => {
      it("should evalutate one step the expression", () => {
        const e = exp(plus, v(1), exp(plus, v(2), v(3)));

        const e2 = e.step();
        const native = plus.exp;
        assert.deepStrictEqual(e2, exp(native, v(1), exp(plus, v(2), v(3))));

        const e3 = e2.step();
        assert.deepStrictEqual(e3, exp(native, v(1), exp(native, v(2), v(3))));

        const e4 = e3.step();
        assert.deepStrictEqual(e4, exp(native, v(1), v(5)));

        const e5 = e4.step();
        assert.deepStrictEqual(e5, v(6));
      });
    });

    context("multiple hopped operator", () => {
      it("should evalutate one step the expression", () => {
        const store = new Store();
        store.set("plus0", plus);
        store.set("plus1", path("plus0"));

        const e = exp("plus1", v(1), v(2));

        const reduced = e.reduce(store);
        assert.deepStrictEqual(reduced, v(3));
      });
    });
  });

  describe("#reduce", () => {
    context("val args", () => {
      it("should reduce the expression", () => {
        const e = exp(plus, v(1), v(2));
        const store = new Store();
        assert.deepStrictEqual(e.reduce(store), v(3));
      });
    });

    context("with ref arg", () => {
      it("should keep the expression with evaluated exp args", () => {
        const path = new Path(new UUID(), new UUID());
        const e = exp(plus, path, exp(plus, v(1), v(2)));
        const native = plus.exp;
        assert.deepStrictEqual(e.reduce(), exp(native, path, v(3)));
      });
    });

    context("nested", () => {
      it("should reduce the nested expression", () => {
        const e = exp(plus, v(1), exp(plus, v(2), v(3)));
        assert.deepStrictEqual(e.reduce(), v(6));
      });
    });
  });
});
