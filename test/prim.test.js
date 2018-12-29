import assert from 'assert';
import { sym } from '../src/sym';
import { prim } from '../src/prim';
import v from '../src/v';

describe("Prim", () => {
  context("primitive value", () => {
    describe("#id", () => {
      it("should return oneself", () => {
        assert.deepStrictEqual(prim(1).id, new prim(1));
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

    describe("#type", () => {
      it("should return type sym", () => {
        assert.deepStrictEqual(v(1)._type, sym("Number"));
        assert.deepStrictEqual(v("foo")._type, sym("String"));
        assert.deepStrictEqual(v(true)._type, sym("Boolean"));
        assert.deepStrictEqual(v(null)._type, sym("Null"));
      });
    });

    describe("#object", () => {
      assert.deepStrictEqual(v(1).object(), 1);
      assert.deepStrictEqual(v("foo").object(), "foo");
      assert.deepStrictEqual(v(true).object(), true);
      assert.deepStrictEqual(v(null).object(), null);
    });
  });
});
