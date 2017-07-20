export default class Ctx {
  constructor(parent=undefined, id=undefined) {
    this.parent = parent;
    this.id = id;
  }

  get book() {
    return this.parent.book;
  }
}
