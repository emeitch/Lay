import assert from 'assert';

import { uuid } from '../src/uuid';
import v from '../src/v';

import { form } from '../src/form';

describe("From", () => {
  const key = uuid();
  const val = v(3);
  const f = form(key, val);

  context("#key", () => {
    it("should return key", () => {
      assert.deepStrictEqual(f.key, key);
    });
  });

  context("#val", () => {
    it("should return key", () => {
      assert.deepStrictEqual(f.val, val);
    });
  });
});
