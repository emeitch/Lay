import assert from 'assert';
import UUID from '../src/uuid'

describe('UUID', () => {
  describe('#urn', () => {
    it('should uuid urn', () => {
      assert.ok(new UUID().urn.match(/^urn:uuid:.*$/));
    });
  });
});