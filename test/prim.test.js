import assert from 'assert';

import v from '../src/v';

describe("Prim", () => {
  context("primitive value", () => {
    describe("#id", () => {
      it("should return oneself", () => {
        assert.deepStrictEqual(v(1).id, v(1));
        assert.deepStrictEqual(v("foo").id, v("foo"));
        assert.deepStrictEqual(v(true).id, v(true));
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
