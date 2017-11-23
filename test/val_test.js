import assert from 'assert';

import Hash from '../src/hash';
import Val, { v, Prim } from '../src/val';

describe("Val", () => {
  context("number origin", () => {
    let val;
    beforeEach(() => {
      val = v(0);
    });

    describe("v function", () => {
      it("should suger for Val constructor", () => {
        assert.deepStrictEqual(v(0), val);
      });
    });

    describe("#origin", () => {
      it("should return original value", () => {
        assert.deepStrictEqual(val.origin, 0);
      });
    });

    describe("#reduce", () => {
      it("should return oneself", () => {
        assert.deepStrictEqual(val.reduce(), val);
      });
    });

    describe("#toJSON", () => {
      it("should return JSON stringified original value", () => {
        assert.deepStrictEqual(val.toJSON(), "0");
      });
    });

    describe("#match", () => {
      it("should collate the original value equivalency", () => {
        assert.deepStrictEqual(v(0).match(val)["it"], v(0));
        assert(v(1).match(val) === undefined);

        const Inherited = class extends Val {};
        // same origin but different constructor
        assert(!new Inherited(0).match(val));
      });
    });

    describe("#equals", () => {
      it("should return equality for other vals", () => {
        assert(v(0).equals(v(0)));
        assert(!v(0).equals(v(1)));
      });

      context("with js object", () => {
        it("should return equality for other js object vals", () => {
          assert(v({a: 1, b: 2}).equals(v({a: 1, b: 2})));
          assert(!v({a: 1, b: 2}).equals(v({a: 2, b: 1})));
        });
      });

      context("with js array", () => {
        it("should return equality for other js object vals", () => {
          assert(v([1, 2]).equals(v([1, 2])));
          assert(!v([1, 2]).equals(v([1, 2, 3])));
        });
      });
    });

    describe("#id", () => {
      it("should return a hash", () => {
        assert(v({a: 1, b: 2}).id.equals(new Hash({a: 1, b: 2})));
      });
    });
  });

  context("primitive value", () => {
    describe("#constructor", () => {
      it("should return Prim", () => {
        assert(v(1).constructor === Prim);
        assert(v("foo").constructor === Prim);
        assert(v(true).constructor === Prim);
      });
    });

    describe("#id", () => {
      it("should return oneself", () => {
        assert(v(1).id.equals(v(1)));
        assert(v("foo").id.equals(v("foo")));
        assert(v(true).id.equals(v(true)));
      });
    });
  });
});
