import assert from 'assert';

import Ref from '../src/ref';
import self from '../src/self';

describe("self", () => {
  it("should be instance of Ref", () => {
    assert(self instanceof Ref);
  });

  describe("#toString", () => {
    it("should return self", () => {
      assert(self.toString() === "$:self");
    });
  });

  describe("#toJSON", () => {
    it("should return self", () => {
      assert(self.toString() === "$:self");
    });
  });
});
