import assert from 'assert';
import UUID from '../src/uuid'

describe('UUID', () => {
  describe('#urn', () => {
    it('should return uuid urn', () => {
      assert(new UUID().urn.match(/^urn:uuid:.*$/));
    });
  });
});