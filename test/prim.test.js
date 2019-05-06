import assert from 'assert';
import { prim } from '../src/prim';
import v from '../src/v';

describe("Prim", () => {
  context("primitive value", () => {
    describe("#reducible", () => {
      it("should return false", () => {
        assert.deepStrictEqual(prim(1).reducible, false);
        assert.deepStrictEqual(v(1).reducible, false);
        assert.deepStrictEqual(v("foo").reducible, false);
        assert.deepStrictEqual(v(true).reducible, false);
        assert.deepStrictEqual(v(null).reducible, false);
      });
    });

    describe("#type", () => {
      it("should return type sym", () => {
        assert.deepStrictEqual(prim(1).typeName, "Number");

        assert.deepStrictEqual(v(1).typeName, "Number");
        assert.deepStrictEqual(v("foo").typeName, "String");
        assert.deepStrictEqual(v(true).typeName, "Boolean");
        assert.deepStrictEqual(v(null).typeName, "Null");
      });
    });

    describe("#object", () => {
      it("should return a javascript object", () => {
        assert.deepStrictEqual(v(1).object(), 1);
        assert.deepStrictEqual(v("foo").object(), "foo");
        assert.deepStrictEqual(v(true).object(), true);
        assert.deepStrictEqual(v(null).object(), null);
      });
    });
  });
});
