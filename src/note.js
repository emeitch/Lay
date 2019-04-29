import v from './v';

const noteSchemaMap = new Map([
  ["rev", null],
  ["id", null],
  ["val", null],
  ["prev", null],
  ["src", null]
]);

const notePropKeys = Array.from(noteSchemaMap.keys());

export default class Note {
  // static get schemaMap() {
  //   return noteSchemaMap;
  // }

  static get keys() {
    return notePropKeys;
  }

  constructor(...args) {
    const keys = this.constructor.keys;
    args.forEach((v, i) => {
      this[keys[i]] = v;
    });
  }

  get(key) {
    const k = v(key).keyVal();

    const matched = k.origin.match(/^_(.*)/);
    const metakey = matched && matched[1];
    if (metakey && this.constructor.keys.includes(metakey)) {
      return this[metakey];
    }

    return undefined;
  }
}

export function note(...args) {
  return new Note(...args);
}
