import Env from './env';

import { v } from './val';
import UUID from './uuid';
import Note from './note';
import Obj from './obj';
import { nameKey, transaction, transactionTime, invalidate } from './ontology';

export default class Book extends Env {
  constructor() {
    super();
    this.notes = new Map();
    this.activeNotesCache = new Map();
    this.invalidationNotesCache = new Map();
  }

  get book() {
    return this;
  }

  getNote(noteid) {
    return this.notes.get(noteid);
  }

  findNotes(cond) {
    const notes = [];

    // todo: 線形探索になっているので高速化する
    for (const [, note] of this.notes) {
      const keys = Object.keys(cond);
      if (keys.every((k) => JSON.stringify(note[k]) === JSON.stringify(cond[k]))) {
        notes.push(note);
      }
    }

    return notes;
  }

  cacheIndex(id, key) {
    return id + "__" + key;
  }

  activeNotes(id, key, at=new Date()) {
    const i = this.cacheIndex(id, key);
    const anotes = new Map(this.activeNotesCache.get(i));
    const inotes = new Map(this.invalidationNotesCache.get(i));

    for (let [, note] of anotes) {
      if (note.at && note.at > at) {
        anotes.delete(note.noteid);
      }
    }

    for (let [, inote] of inotes) {
      const note = anotes.get(inote.id);
      if (note && (!inote.at || inote.at <= at)) {
        anotes.delete(note.noteid);
      }
    }

    return Array.from(anotes.values()).sort((a, b) => {
      if (a.at === undefined) {
        return -1;
      } else if (b.at === undefined) {
        return 1;
      } else {
        return a.at.getTime() - b.at.getTime();
      }
    });
  }

  activeNote(id, key, at=new Date()) {
    const actives = this.activeNotes(id, key, at);
    return actives[actives.length-1];
  }

  obj(id) {
    return new Obj(this, id);
  }

  transactionObj(note) {
    const tnotes = this.findNotes({id: note.noteid, key: transaction});

    if (tnotes.length === 0) {
      return undefined;
    }

    const tnote = tnotes[0];
    const tid = tnote.val;
    return this.obj(tid);
  }

  resolve(name) {
    const notes = this.findNotes({key: nameKey, val: v(name)});
    const note = notes[notes.length-1];
    return note ? note.id : undefined;
  }

  assign(name, id) {
    // todo: ユニーク制約をかけたい
    this.putNote(id, nameKey, v(name));
  }

  syncCache(note) {
    const i = this.cacheIndex(note.id, note.key);
    const al = this.activeNotesCache.get(i) || new Map();
    al.set(note.noteid, note);
    this.activeNotesCache.set(i, al);

    if (note.key === invalidate) {
      const positive = this.getNote(note.id);
      const i = this.cacheIndex(positive.id, positive.key);
      const il = this.invalidationNotesCache.get(i) || new Map();
      il.set(note.noteid, note);
      this.invalidationNotesCache.set(i, il);
    }
  }

  doTransaction(block) {
    // todo: アトミックな操作に修正する
    const addNote = (note) => {
      this.notes.set(note.noteid, note);
      this.syncCache(note);
    };
    const tid = new UUID();
    const ttnote = new Note(tid, transactionTime, v(new Date()));

    addNote(ttnote);

    const noteWithTransaction = (...args) => {
      const note = new Note(...args);
      addNote(note);
      const tnote = new Note(note.noteid, transaction, tid);
      addNote(tnote);
      return note;
    };
    return block(noteWithTransaction);
  }

  putNote(...attrs) {
    return this.doTransaction(noteWithTransaction => {
      return noteWithTransaction(...attrs);
    });
  }
}
