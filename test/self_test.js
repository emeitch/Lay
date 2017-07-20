import assert from 'assert';

import { self } from '../src/self';

import Ref from '../src/ref';
import UUID from '../src/uuid';
import Ctx from '../src/ctx';
import Book from '../src/book';

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
    let ctx;
    context("with ctx which has id", () => {
      const id = new UUID();
      beforeEach(() => {
        ctx = new Ctx(new Book(), id);
      });

      it("should return the ctx id", () => {
        assert.deepStrictEqual(self.reduce(ctx), id);
      });
    });

    context("with ctx which has no id", () => {
      beforeEach(() => {
        ctx = new Ctx(new Book());
      });

      it("should return self", () => {
        assert.deepStrictEqual(self.reduce(ctx), self);
      });
    });
  });
});
