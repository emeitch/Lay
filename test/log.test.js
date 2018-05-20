import assert from 'assert';

import UUID from '../src/uuid';
import Log, { n } from '../src/log';
import { sym } from '../src/sym';
import { path } from '../src/path';
import { pack } from '../src/pack';
import v from '../src/v';
import Book from '../src/book';

describe("Log", () => {
  const id = new UUID();
  const key = new UUID();
  const val = new UUID();

  let log;
  beforeEach(() => {
    log = n(id, key, val);
  });

  describe("#logid", () => {
    it("should return a uuid", () => {
      assert(log.logid.constructor === UUID);
    });
  });

  describe("constructor", () => {
    it("should require a id", () => {
      assert.throws(() => new Log(), /id is required/);
    });

    it("should require a key", () => {
      assert.throws(() => new Log(id), /key is required/);
    });

    context("js string", () => {
      const l = new Log("foo", "bar", "baz");
      assert.deepStrictEqual(l.id, v("foo"));
      assert.deepStrictEqual(l.key, v("bar"));
      assert.deepStrictEqual(l.val, v("baz"));
    });
  });

  describe("object", () => {
    it("should return js object", () => {
      {
        const log = new Log("id", "key", "val");
        const lobj = log.object(new Book());
        assert.deepStrictEqual(lobj.id, "id");
        assert.deepStrictEqual(lobj.key, "key");
        assert.deepStrictEqual(lobj.val, "val");
      }
      {
        const book = new Book();
        const prt = new UUID();
        book.set("Foo", prt);

        const log = new Log("id", "type", pack(path("Foo")));
        const lobj = log.object(book);
        assert.deepStrictEqual(lobj.id, "id");
        assert.deepStrictEqual(lobj.key, "type");
        assert.deepStrictEqual(lobj.val, {type: {origin: "Path"}, origin: [sym("Foo")]});
      }
    });
  });
});
