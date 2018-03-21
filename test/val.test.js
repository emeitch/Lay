import assert from 'assert';

import Val from '../src/val';
import { sym } from '../src/sym';
import v from '../src/v';

describe("Val", () => {
  context("number origin", () => {
    const Inherited = class ExtendedVal extends Val {};
    const val = new Inherited(0);

    describe("#origin", () => {
      it("should return original value", () => {
        assert.deepStrictEqual(val.origin, 0);
      });
    });

    describe("#tag", () => {
      it("should return tag sym", () => {
        assert.deepStrictEqual(val.tag, sym("ExtendedVal"));
      });
    });

    describe("#_toStr", () => {
      it("should return string prim", () => {
        assert.deepStrictEqual(val._toStr, v("0"));
      });
    });

    describe("#id", () => {
      it("should return oneslf by default behavior", () => {
        assert.deepStrictEqual(val.id, val);
      });
    });

    describe("#get", () => {
      it("should return underscore prefix _key's val", () => {
        assert.deepStrictEqual(val.get("tag"), sym("ExtendedVal"));
        assert.deepStrictEqual(val.get(sym("tag")), sym("ExtendedVal"));
      });

      context("not exists key", () => {
        it("should return null val", () => {
          assert.deepStrictEqual(val.get("notExists"), v(null));
        });
      });
    });

    describe("#equals", () => {
      it("should return equality for other vals", () => {
        assert(v(0).equals(v(0)));
        assert(!v(0).equals(v(1)));
      });
    });

    describe("#_equals", () => {
      it("should return equality for other vals", () => {
        assert.deepStrictEqual(v(0)._equals(v(0)), v(true));
        assert.deepStrictEqual(v(0)._equals(v(1)), v(false));
      });
    });

    describe("#reducible", () => {
      it("should return true by default behavior", () => {
        assert.deepStrictEqual(val.reducible, true);
      });
    });

    describe("#step", () => {
      it("should return oneself by default behavior", () => {
        assert.deepStrictEqual(val.step(), val);
      });
    });

    describe("#reduce", () => {
      it("should return oneself by default behavior", () => {
        assert.deepStrictEqual(val.reduce(), val);
      });
    });

    describe("#replace", () => {
      it("should return oneself by default behavior", () => {
        assert.deepStrictEqual(val.replace(), val);
      });
    });

    describe("#replaceAsTop", () => {
      it("should return oneself by default behavior", () => {
        assert.deepStrictEqual(val.replaceAsTop(), val);
      });
    });

    describe('#collate', () => {
      it("should return only 'it' collation by default behavior", () => {
        const v0 = new Inherited(0);
        assert.deepStrictEqual(val.collate(v0), {__it__: v0});

        const v1 = new Inherited(1);
        assert.deepStrictEqual(val.collate(v1), null);
      });
    });

    describe("#match", () => {
      it("should collate the original value equivalency", () => {
        const v0 = new Inherited(0);
        assert.deepStrictEqual(v0.match(val), {__it__: v0});

        const v1 = new Inherited(1);
        assert.deepStrictEqual(v1.match(val), null);

        const Inherited2 = class extends Val {};
        // same origin but different constructor
        assert(!new Inherited2(0).match(val));
      });
    });

    describe("#stringify", () => {
      it("should return original value string", () => {
        assert.deepStrictEqual(val.stringify(), "0");
      });
    });
  });

  context("direct construction", () => {
    it("should throw error", () => {
      assert.throws(() => new Val(0), /Can not create Val instances. 'Val' is abstruct class./);
    });
  });
});
