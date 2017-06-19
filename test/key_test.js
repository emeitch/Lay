import assert from 'assert';

import UUID from '../src/uuid';
import Key from '../src/key';

describe("Key", () => {
  const prop1 = new UUID();

  let key;
  beforeEach(() => {
    key = new Key(prop1);
  });

  describe("constructor", () => {
    it("should return key instance", () => {
      assert(key.constructor === Key);
    });
  });

  describe("#props", () => {
    it("should return property id array", () => {
      assert.deepStrictEqual(key.path, [prop1]);
    });
  });
});