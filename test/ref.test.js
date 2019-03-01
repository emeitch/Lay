import assert from 'assert';

import Store from '../src/store';
import Ref, { ref } from '../src/ref';
import v from '../src/v';

describe("Ref", () => {
  describe("ref", () => {
    it("should return Ref instance", () => {
      assert(ref("foo") instanceof Ref);
    });
  });

  describe("#reduce", () => {
    it("should fetch stored obj", () => {
      const store = new Store();
      store.put({
        _id: "foo",
        bar: 1
      });

      assert.deepStrictEqual(ref("foo").reduce(store).getOwnProp("bar"), v(1));
      assert.deepStrictEqual(ref("buz").reduce(store), ref("buz")); // nothing
    });
  });

  describe("#object", () => {
    it("should return a persistent object without type", () => {
      assert.deepStrictEqual(ref("foo").object(), {origin: "foo"});
    });
  });

  describe("#keyString", () => {
    it("should return a string for key", () => {
      assert.deepStrictEqual(ref("foo").keyString(), "foo");
    });
  });
});
