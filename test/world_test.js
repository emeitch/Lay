import assert from 'assert';

import { v } from '../src/val';
import UUID from '../src/uuid';
import Note from '../src/note';
import World from '../src/world';
import Obj from '../src/obj';
import { transaction, transactionTime, invalidate } from '../src/ontology';

describe("World", () => {
  const id = new UUID();
  const key = new UUID();
  const val = new UUID();

  let world;
  beforeEach(() => {
    world = new World();
  });

  describe("#put", () => {
    context("standard arguments", () => {
      let note;
      beforeEach(() => {
        note = new Note(id, key, val);
        world.put(note);
      });

      it("should append a note", () => {
        assert(note.id === id);
        assert(note.key === key);
        assert(note.val === val);
        assert(note.in === undefined);
        assert(world.note(note.noteid) === note);
      });

      it("should append a transaction note", () => {
        const tnotes = world.findNotes({id: note.noteid, key: transaction});
        assert(tnotes.length === 1);
      });

      it("should append a transaction data", () => {
        const tobj = world.transactionObj(note);
        assert(tobj.get(transactionTime).origin.constructor === Date);
      });
    });

    context("with location", () => {
      const location = new UUID();

      let note;
      beforeEach(() => {
        note = new Note(id, key, val, undefined, location);
        world.put(note);
      });

      it("should append a note with location", () => {
        assert(note.id === id);
        assert(note.key === key);
        assert(note.val === val);
        assert(note.in === location);
        assert(world.note(note.noteid) === note);
      });
    });

    context("with time", () => {
      const time = new Date(2017, 0);

      let note;
      beforeEach(() => {
        note = new Note(id, key, val, time);
        world.put(note);
      });

      it("should append a note with time", () => {
        assert(note.id === id);
        assert(note.key === key);
        assert(note.val === val);
        assert(note.at === time);
        assert(world.note(note.noteid) === note);
      });
    });
  });

  describe("#transactionObj", () => {
    let tobj;
    beforeEach(() => {
      const note = new Note(id, key, val);
      world.put(note);
      tobj = world.transactionObj(note);
    });

    it("should has no more transaction", () => {
      assert(world.transactionObj(tobj.id) === undefined);
    });
  });

  describe("#resolve", () => {
    context("name un assigned", () => {
      it("should return undefined", () => {
        assert(world.resolve("unassigned") === undefined);
      });
    });

    context("name assigned", () => {
      beforeEach(() => {
        world.assign("i", id);
        world.assign("k", key);
        world.assign("v", val);
      });

      it("should return a id by name", () => {
        assert(world.resolve("i") === id);
        assert(world.resolve("k") === key);
        assert(world.resolve("v") === val);
      });

      context("name re-assigned", () => {
        const key2 = new UUID();

        beforeEach(() => {
          world.assign("r", key2);
        });

        it("should return a re-assigned id by name", () => {
          assert(world.resolve("r") === key2);
        });
      });
    });
  });

  describe("#activeNotes", () => {
    context("no notes", () => {
      it("should return empty", () => {
        const notes = world.activeNotes(id, key);
        assert(notes.length === 0);
      });
    });

    context("notes with same ids & keys but different vals", () => {
      beforeEach(() => {
        world.put(new Note(id, key, v("val0")));
        world.put(new Note(id, key, v("val1")));
      });

      it("should return all notes", () => {
        const notes = world.activeNotes(id, key);
        assert.deepStrictEqual(notes[0].val, v("val0"));
        assert.deepStrictEqual(notes[1].val, v("val1"));
      });

      context("invalidate the last note", () => {
        beforeEach(() => {
          const note = world.activeNote(id, key);
          world.put(new Note(note.noteid, invalidate));
        });

        it("should return only the first note", () => {
          const notes = world.activeNotes(id, key);
          assert.deepStrictEqual(notes[0].val, v("val0"));
          assert.deepStrictEqual(notes[1], undefined);
        });
      });
    });

    context("notes with applying time", () => {
      beforeEach(() => {
        world.put(new Note(id, key, v("val0"), new Date(2017, 0)));
        world.put(new Note(id, key, v("val1"), new Date(2017, 2)));
      });

      it("should return all notes", () => {
        const notes = world.activeNotes(id, key);
        assert.deepStrictEqual(notes[0].val, v("val0"));
        assert.deepStrictEqual(notes[1].val, v("val1"));
      });

      it("should return only the first note by specifying time before applied", () => {
        const notes = world.activeNotes(id, key, new Date(2017, 1));
        assert.deepStrictEqual(notes[0].val, v("val0"));
        assert.deepStrictEqual(notes[1], undefined);
      });

      context("invalidate the last note", () => {
        beforeEach(() => {
          const note = world.activeNote(id, key);
          world.put(new Note(note.noteid, invalidate));
        });

        it("should return only the first note", () => {
          const notes = world.activeNotes(id, key);
          assert.deepStrictEqual(notes[0].val, v("val0"));
          assert.deepStrictEqual(notes[1], undefined);
        });
      });

      context("invalidate the last note with applying time", () => {
        beforeEach(() => {
          const note = world.activeNote(id, key);
          world.put(new Note(note.noteid, invalidate, undefined, new Date(2017, 4)));
        });

        it("should return only the first note", () => {
          const notes = world.activeNotes(id, key, new Date(2017, 6));
          assert.deepStrictEqual(notes[0].val, v("val0"));
          assert.deepStrictEqual(notes[1], undefined);
        });

        it("should return only the first note by time specified just invalidation time", () => {
          const notes = world.activeNotes(id, key, new Date(2017, 4));
          assert.deepStrictEqual(notes[0].val, v("val0"));
          assert.deepStrictEqual(notes[1], undefined);
        });

        it("should return all notes by time specified before invalidation", () => {
          const notes = world.activeNotes(id, key, new Date(2017, 3));
          assert.deepStrictEqual(notes[0].val, v("val0"));
          assert.deepStrictEqual(notes[1].val, v("val1"));
        });
      });
    });

    context("contain notes with old applying time", () => {
      beforeEach(() => {
        world.put(new Note(id, key, v("val0"), new Date(2017, 1)));
        world.put(new Note(id, key, v("val1"), new Date(2017, 0)));
      });

      it("should return all notes order by applying time", () => {
        const notes = world.activeNotes(id, key);
        assert.deepStrictEqual(notes[0].val, v("val1"));
        assert.deepStrictEqual(notes[1].val, v("val0"));
      });

      context("invalidate the last note", () => {
        beforeEach(() => {
          const note = world.activeNote(id, key);
          world.put(new Note(note.noteid, invalidate));
        });

        it("should return only the first note", () => {
          const notes = world.activeNotes(id, key);
          assert.deepStrictEqual(notes[0].val, v("val1"));
          assert.deepStrictEqual(notes[1], undefined);
        });
      });
    });

    context("contain a note with time and a note without time", () => {
      beforeEach(() => {
        world.put(new Note(id, key, v("val0"), new Date(2017, 2)));
        world.put(new Note(id, key, v("val1")));
      });

      it("should return all notes order by applying time", () => {
        const notes = world.activeNotes(id, key);
        assert.deepStrictEqual(notes[0].val, v("val1"));
        assert.deepStrictEqual(notes[1].val, v("val0"));
      });
    });
  });

  describe("#activeNote", () => {
    context("no notes", () => {
      it("should return undefined", () => {
        const note = world.activeNote(id, key);
        assert.deepStrictEqual(note, undefined);
      });
    });

    context("notes with applying time", () => {
      beforeEach(() => {
        world.put(new Note(id, key, v("val0"), new Date(2017, 0)));
        world.put(new Note(id, key, v("val1"), new Date(2017, 2)));
      });

      it("should return the last note", () => {
        const note = world.activeNote(id, key);
        assert.deepStrictEqual(note.val, v("val1"));
      });

      it("should return the first note by specifying time", () => {
        const note = world.activeNote(id, key, new Date(2017, 1));
        assert.deepStrictEqual(note.val, v("val0"));
      });
    });
  });

  describe("#obj", () => {
    beforeEach(() => {
      world.put(new Note(id, key, val));
    });

    it("should return the obj", () => {
      const o = world.obj(id);
      assert(o.constructor === Obj);
    });
  });
});
