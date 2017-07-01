import assert from 'assert';

import Ref from '../src/ref';
import self from '../src/self';

describe("self", () => {
  it("should be instance of Ref", () => {
    assert(self instanceof Ref);
  });
});
