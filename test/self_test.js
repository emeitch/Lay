import assert from 'assert';

import { self } from '../src/self';

import Ref from '../src/ref';
import UUID from '../src/uuid';
import Env from '../src/env';
import Box from '../src/box';

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

  describe("#reduce", () => {
    let env;
    context("with env which has id", () => {
      const id = new UUID();
      beforeEach(() => {
        env = new Env(new Box(), id);
      });

      it("should return the env id", () => {
        assert.deepStrictEqual(self.reduce(env), id);
      });
    });

    context("with env which has no id", () => {
      beforeEach(() => {
        env = new Env(new Box());
      });

      it("should return self", () => {
        assert.deepStrictEqual(self.reduce(env), self);
      });
    });
  });
});
