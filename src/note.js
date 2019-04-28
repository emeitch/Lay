export default class Note {
  constructor(rev, id, val, prev, src) {
    // required
    this.rev = rev;
    this.id = id;
    this.val = val;

    // optional
    this.prev = prev;
    this.src = src;
  }
}

export function note(...args) {
  return new Note(...args);
}
