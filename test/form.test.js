import assert from 'assert';

import { uuid } from '../src/uuid';
import v from '../src/v';

import { form } from '../src/form';

describe("From", () => {
  const key = uuid();
  const val = v(3);
  const rev = uuid();
  const f = form(key, val, rev);

  context("#key", () => {
    it("should return the key prop", () => {
      assert.deepStrictEqual(f.key, key);
    });
  });

  context("#val", () => {
    it("should return the val prop", () => {
      assert.deepStrictEqual(f.val, val);
    });
  });

  context("#rev", () => {
    it("should return the rev prop", () => {
      assert.deepStrictEqual(f.rev, rev);
    });
  });
});
