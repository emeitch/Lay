import assert from 'assert';

import v from '../src/v';
import UUID from '../src/uuid';
import { ctx } from '../src/ctx';

describe("Ctx", () => {
  describe("#origin", () => {
    context("simple origin", () => {
      it("should return origin vals", () => {
        const i = new UUID();
        const c = ctx(i, "foo");
        assert.deepStrictEqual(c.origin, [i, v("foo")]);
      });
    });
  });

  describe("#object", () => {
    it("should return js object", () => {
      const i = new UUID("dummy");
      const c = ctx(i, "foo");
      assert.deepStrictEqual(c.object(), {
        type: {
          origin: "Ctx"
        },
        origin: [
          {
            type: {
              origin: "UUID"
            },
            origin: "dummy"
          },
          "foo"
        ]});
    });
  });
});
