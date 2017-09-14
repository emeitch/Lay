import assert from 'assert';

import { v } from '../src/val';
import { self } from '../src/self';
import UUID from '../src/uuid';
import Path from '../src/path';
import Note from '../src/note';
import World from '../src/world';
import { invalidate } from '../src/ontology';

describe("Obj", () => {
  const id = new UUID();
  const key = new UUID();

  let world;
  let obj;
  beforeEach(() => {
    world = new World();
    obj = world.obj(id);
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
        world.put(new Note(id, key, dst));
      });

      it("should return a obj of note's val", () => {
        assert.deepStrictEqual(obj.get(key), world.obj(dst));
      });
    });

    context("with a note which has a val typed by Val", () => {
      beforeEach(() => {
        world.put(new Note(id, key, v("value")));
      });

      it("should return a value", () => {
        assert.deepStrictEqual(obj.get(key), v("value"));
      });
    });

    context("with the same key but different val notes", () => {
      beforeEach(() => {
        world.put(new Note(id, key, v("val0")));
        world.put(new Note(id, key, v("val1")));
      });

      it("should return the last val", () => {
        assert.deepStrictEqual(obj.get(key), v("val1"));
      });
    });

    context("with a invalidated note", () => {
      beforeEach(() => {
        const note = world.put(new Note(id, key, v("val0")));
        world.put(new Note(note.noteid, invalidate));
      });

      it("should return undefined", () => {
        assert.deepStrictEqual(obj.get(key), undefined);
      });

      context("add another note", () => {
        beforeEach(() => {
          world.put(new Note(id, key, v("val1")));
        });

        it("should return the val", () => {
          assert.deepStrictEqual(obj.get(key), v("val1"));
        });
      });

      context("add a note which has same args for the invalidated note", () => {
        beforeEach(() => {
          world.put(new Note(id, key, v("val0")));
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
        
        world.put(new Note(id2, key2, id3));
        world.put(new Note(id3, key3, v("path end")));
        world.put(new Note(id, key, new Path(id2, key2, key3)));
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
        
        world.put(new Note(id, key2, val2));
        world.put(new Note(id, key, new Path(self, key2)));
      });

      it("should return the val", () => {
        assert.deepStrictEqual(obj.get(key), val2);
      });
    });
  });
});
