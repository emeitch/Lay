import assert from 'assert';

import { v } from '../src/val';
import { self } from '../src/self';
import UUID from '../src/uuid';
import Path from '../src/path';
import Book from '../src/book';
import { invalidate } from '../src/ontology';

describe("Obj", () => {
  const id = new UUID();
  const key = new UUID();

  let book;
  let obj;
  beforeEach(() => {
    book = new Book();
    obj = book.obj(id);
  });

  describe("#get", () => {
    context("without notes", () => {
      it("should return undefined", () => {
        assert(obj.get(key) === undefined);
      });
    });

    context("with a note which has a val typed by UUID", () => {
      const dst = new UUID();

      beforeEach(() => {
        book.putNote(id, key, dst);
      });

      it("should return a obj of note's val", () => {
        assert.deepStrictEqual(obj.get(key), book.obj(dst));
      });
    });

    context("with a note which has a val typed by Val", () => {
      beforeEach(() => {
        book.putNote(id, key, v("value"));
      });

      it("should return a value", () => {
        assert.deepStrictEqual(obj.get(key), v("value"));
      });
    });

    context("with the same key but different val notes", () => {
      beforeEach(() => {
        book.putNote(id, key, v("val0"));
        book.putNote(id, key, v("val1"));
      });

      it("should return the last val", () => {
        assert.deepStrictEqual(obj.get(key), v("val1"));
      });
    });

    context("with a invalidated note", () => {
      beforeEach(() => {
        const note = book.putNote(id, key, v("val0"));
        book.putNote(note.noteid, invalidate);
      });

      it("should return undefined", () => {
        assert.deepStrictEqual(obj.get(key), undefined);
      });

      context("add another note", () => {
        beforeEach(() => {
          book.putNote(id, key, v("val1"));
        });

        it("should return the val", () => {
          assert.deepStrictEqual(obj.get(key), v("val1"));
        });
      });

      context("add a note which has same args for the invalidated note", () => {
        beforeEach(() => {
          book.putNote(id, key, v("val0"));
        });

        it("should return the val", () => {
          assert.deepStrictEqual(obj.get(key), v("val0"));
        });
      });
    });

    context("with a absolute path", () => {
      beforeEach(() => {
        const id2 = new UUID();
        const id3 = new UUID();
        const key2 = new UUID();
        const key3 = new UUID();
        book.putNote(id2, key2, id3);
        book.putNote(id3, key3, v("path end"));
        book.putNote(id, key, new Path(id2, key2, key3));
      });

      it("should return the val", () => {
        assert.deepStrictEqual(obj.get(key), v("path end"));
      });
    });

    context("with a relative path", () => {
      let val2;
      beforeEach(() => {
        val2 = v("val0");
        const key2 = new UUID();
        book.putNote(id, key2, val2);
        book.putNote(id, key, new Path(self, key2));
      });

      it("should return the val", () => {
        assert.deepStrictEqual(obj.get(key), val2);
      });
    });
  });
});
