import assert from 'assert';
import { prim } from '../src/prim';
import v from '../src/v';

describe("Prim", () => {
  context("primitive value", () => {
    describe("#protoName", () => {
      it("should return the proto name string", () => {
        assert.deepStrictEqual(prim(1).protoName, "Number");

        assert.deepStrictEqual(v(1).protoName, "Number");
        assert.deepStrictEqual(v("foo").protoName, "String");
        assert.deepStrictEqual(v(true).protoName, "Boolean");
        assert.deepStrictEqual(v(null).protoName, "Null");
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

    describe("#keyString", () => {
      it("should return a javascript string", () => {
        assert.deepStrictEqual(v(1).keyString(), "1");
        assert.deepStrictEqual(v("foo").keyString(), "foo");
        assert.deepStrictEqual(v(true).keyString(), "true");
        assert.deepStrictEqual(v(null).keyString(), "null");
      });
    });
  });
});
