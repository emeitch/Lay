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

    describe("#id", () => {
      it("should return oneslf by default behavior", () => {
        assert.deepStrictEqual(val.id, val);
      });
    });

    describe("#get", () => {
      it("should return key's val", () => {
        assert.deepStrictEqual(val.get("tag"), sym("ExtendedVal"));
        assert.deepStrictEqual(val.get("id"), val);
      });

      context("not exists key", () => {
        it("should throw error", () => {
          assert.throws(() => val.get("not_exists"), /not exists key/);
        });
      });
    });

    describe("#equals", () => {
      it("should return equality for other vals", () => {
        assert(v(0).equals(v(0)));
        assert(!v(0).equals(v(1)));
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
  });

  context("direct construction", () => {
    it("should throw error", () => {
      assert.throws(() => new Val(0), /Can not create Val instances. 'Val' is abstruct class./);
    });
  });
});
