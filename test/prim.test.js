import assert from 'assert';
import { sym } from '../src/sym';
import v from '../src/v';

describe("Prim", () => {
  context("primitive value", () => {
    describe("#id", () => {
      it("should return oneself", () => {
        assert.deepStrictEqual(v(1).id, v(1));
        assert.deepStrictEqual(v("foo").id, v("foo"));
        assert.deepStrictEqual(v(true).id, v(true));
        assert.deepStrictEqual(v(null).id, v(null));
      });
    });

    describe("#reducible", () => {
      it("should return false", () => {
        assert.deepStrictEqual(v(1).reducible, false);
        assert.deepStrictEqual(v("foo").reducible, false);
        assert.deepStrictEqual(v(true).reducible, false);
        assert.deepStrictEqual(v(null).reducible, false);
      });
    });

    describe("#tag", () => {
      it("should return tag sym", () => {
        assert.deepStrictEqual(v(1).tag, sym("Number"));
        assert.deepStrictEqual(v("foo").tag, sym("String"));
        assert.deepStrictEqual(v(true).tag, sym("Boolean"));
        assert.deepStrictEqual(v(null).tag, sym("Null"));
      });
    });
  });
});
