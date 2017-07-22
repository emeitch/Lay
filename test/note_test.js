import assert from 'assert';

import UUID from '../src/uuid';
import Note, { n } from '../src/note';

describe("Note", () => {
  const id = new UUID();
  const key = new UUID();
  const val = new UUID();

  let note;
  beforeEach(() => {
    note = n(id, key, val);
  });

  describe("#noteid", () => {
    it("should return a uuid", () => {
      assert(note.noteid.constructor === UUID);
    });
  });

  describe("constructor ", () => {
    it("should require a id", () => {
      assert.throws(() => new Note(), /id is required/);
    });

    it("should require a key", () => {
      assert.throws(() => new Note(id), /key is required/);
    });

    it("should constrain a val typed Val", () => {
      assert.throws(() => new Note(id, key, "unval"), /val is not a Val/);
    });
  });
});
