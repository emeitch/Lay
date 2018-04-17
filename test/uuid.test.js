import assert from 'assert';

import Ref from '../src/ref';
import UUID, { uuid } from '../src/uuid';

describe("Ref", () => {
  describe("get", () => {
    it("should throw error", () => {
      assert.throws(() => new Ref().stringify(), /Ref is abstruct class/);
    });
  });
});

describe("UUID", () => {
  describe("#stringify", () => {
    it("should return uuid urn", () => {
      assert(new UUID().stringify().match(/^urn:uuid:.*$/));
    });
  });

  describe("#reducible", () => {
    it("should return true by default behavior", () => {
      const u = uuid();
      assert.deepStrictEqual(u.reducible, false);
    });
  });
});
