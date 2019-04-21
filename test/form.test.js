import assert from 'assert';

import { uuid } from '../src/uuid';
import { form } from '../src/form';

describe("From", () => {
  const id = uuid();
  const f = form(id);

  context("#key", () => {
    it("should return key", () => {
      assert.deepStrictEqual(f.key, id);
    });
  });
});
