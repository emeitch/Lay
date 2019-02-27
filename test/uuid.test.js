import assert from 'assert';

import { uuid } from '../src/uuid';

describe("uuid", () => {
  it("should return uuid urn string", () => {
    const u = uuid();
    assert(u.origin.match(/^urn:uuid:.*$/));
  });
});
