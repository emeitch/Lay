import assert from 'assert';

import Store from '../src/store';
import v from '../src/v';

describe("Arr", () => {
  context("complex value", () => {
    describe("#typeName", () => {
      it("should return type sym", () => {
        assert.deepStrictEqual(v([1, 2, 3]).typeName, "Arr");
      });
    });

    describe("#object", () => {
      it("should return js object", () => {
        const store = new Store();

        assert.deepStrictEqual(v([1, 2, 3]).object(store), {
          _proto: "Arr",
          origin: [1, 2, 3]
        });

        assert.deepStrictEqual(v([v(1), v("foo"), v(true), v(null)]).object(store), {
          _proto: "Arr",
          origin: [
            1,
            "foo",
            true,
            null
          ]
        });

        assert.deepStrictEqual(v(["foo", v({bar: 1, buz: false})]).object(store), {
          _proto: "Arr",
          origin: [
            "foo",
            {
              _proto: "Obj",
              bar: 1,
              buz: false
            }
          ]
        });
      });
    });

    describe("#get", () => {
      it("should return arg index val", () => {
        const val = v([11, 22]);
        assert.deepStrictEqual(val.get(0), v(11));
        assert.deepStrictEqual(val.get(v(1)), v(22));
      });

      context("not exist prop", () => {
        it("should return undefined", () => {
          const val = v([11, 22]);
          assert.deepStrictEqual(val.get(3), undefined);
        });
      });
    });

    describe("#reduce", () => {
      it("should return self value", () => {
        const store = new Store();

        const val = v([11, 22]);
        assert.deepStrictEqual(val.reduce(store), v([11, 22]));
      });
    });

    describe("#collate", () => {
      context("unmatched other val", () => {
        it("should return null", () => {
          assert.deepStrictEqual(v([1]).collate(v({a: 1})).result, null);
        });
      });
    });
  });

  describe("stringify", () => {
    it("should return string dump", () => {
      assert(v([1, 2]).stringify() === "[\n  1, \n  2\n]");
    });
  });
});
