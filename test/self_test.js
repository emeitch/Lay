import assert from 'assert';

import { self } from '../src/self';

import Ref from '../src/ref';
import UUID from '../src/uuid';
import Env from '../src/env';
import Store from '../src/store';

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
    context("with id env", () => {
      const id = new UUID();
      beforeEach(() => {
        env = new Env(new Store(), id);
      });

      it("should return env id", () => {
        assert.deepStrictEqual(self.reduce(env), id);
      });
    });

    context("with id env", () => {
      beforeEach(() => {
        env = new Env(new Store());
      });

      it("should return env id", () => {
        assert.deepStrictEqual(self.reduce(env), self);
      });
    });
  });
});
