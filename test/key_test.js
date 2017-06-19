import assert from 'assert';

import UUID from '../src/uuid';
import Key from '../src/key';

describe("Key", () => {
  const prop1 = new UUID();
  const prop2 = new UUID();
  const prop3 = new UUID();

  let key;
  beforeEach(() => {
    key = new Key(prop1);
  });

  describe("constructor", () => {
    it("should return key instance", () => {
      assert(key.constructor === Key);
    });
  });

  describe("#path", () => {
    it("should return property id array", () => {
      assert.deepStrictEqual(key.path, [prop1]);
    });

    context("many props", () => {
      beforeEach(() => {
        key = new Key(prop1, prop2, prop3);
      });

      it("should return many property ids array", () => {
        assert.deepStrictEqual(key.path, [prop1, prop2, prop3]);
      });
    });
  });
});