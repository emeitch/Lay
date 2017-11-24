import assert from 'assert';

import Prim from '../src/prim';
import v from '../src/v';

describe("Prim", () => {
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

    describe("#reducible", () => {
      it("should return false", () => {
        assert.deepStrictEqual(v(1).reducible, false);
        assert.deepStrictEqual(v("foo").reducible, false);
        assert.deepStrictEqual(v(true).reducible, false);
      });
    });
  });
});
