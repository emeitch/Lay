import assert from 'assert';

import UUID from '../src/uuid';
import Note from '../src/note';

describe("Note", () => {
  const id = new UUID();
  const key = new UUID();
  const val = new UUID();

  let note;
  beforeEach(() => {
    note = new Note(id, key, val);
  });

  describe("#noteid", () => {
    it("should return a uuid", () => {
      assert(note.noteid.constructor === UUID);
    });
  });

  describe("constructor ", () => {
    it("should require id", () => {
      assert.throws(() => new Note(), /id is required/);
    });

    it("should require key", () => {
      assert.throws(() => new Note(id), /key is required/);
    });

    it("should constrain val to Val typed", () => {
      assert.throws(() => new Note(id, key, "unval"), /val is not a Val/);
    });
  });
});
