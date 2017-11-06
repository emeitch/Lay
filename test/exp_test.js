import assert from 'assert';

import { v } from '../src/val';
import { plus } from '../src/func';
import UUID from '../src/uuid';
import Path from '../src/path';
import { exp } from '../src/exp';
import Book from '../src/book';
import { sym } from '../src/sym';

describe("Exp", () => {
  describe("#step", () => {
    context("simple", () => {
      it("should evalutate one step the expression", () => {
        const e = exp(plus, v(1), v(2));
        const book = new Book();

        const e2 = e.step(book);
        // todo2: nativeの取り出し方法やassert方法がダサいのをどうにかする
        const ntv = plus.alts[0].grds[0].exp;
        assert.deepStrictEqual(e2, exp(ntv, v(1), v(2)));

        const e3 = e2.step(book);
        assert.deepStrictEqual(e3, v(3));
      });
    });

    context("nested", () => {
      it("should evalutate one step the expression", () => {
        const e = exp(plus, v(1), exp(plus, v(2), v(3)));

        const e2 = e.step();
        const ntv = plus.alts[0].grds[0].exp;
        assert.deepStrictEqual(e2, exp(ntv, v(1), exp(plus, v(2), v(3))));

        // todo3: もっとstepを踏めるようにするべきでは?

        const e3 = e2.step();
        assert.deepStrictEqual(e3, v(6));
      });
    });

    context("multiple hopped operator", () => {
      it("should evalutate one step the expression", () => {
        const book = new Book();
        book.assign("plus0", plus);
        book.assign("plus1", sym("plus0"));

        const e = exp("plus1", v(1), v(2));

        const e2 = e.step(book);
        assert.deepStrictEqual(e2, exp("plus0", v(1), v(2)));

        const e3 = e2.step(book);
        assert.deepStrictEqual(e3, exp(plus, v(1), v(2)));

        const e4 = e3.step(book);
        const ntv = plus.alts[0].grds[0].exp;
        assert.deepStrictEqual(e4, exp(ntv, v(1), v(2)));

        const e5 = e4.step(book);
        assert.deepStrictEqual(e5, v(3));
      });
    });
  });

  describe("#reduce", () => {
    context("val args", () => {
      it("should reduce the expression", () => {
        const e = exp(plus, v(1), v(2));
        const book = new Book();
        assert.deepStrictEqual(e.reduce(book), v(3));
      });
    });

    context("with ref arg", () => {
      it("should keep the expression", () => {
        const path = new Path(new UUID(), new UUID());
        const e = exp(plus, path, v(2));
        // todo4: 適当な値が返ってきているので是正
        assert.deepStrictEqual(e.reduce(), v(0));
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
