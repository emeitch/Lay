export default class Ctx {
  constructor(parent=undefined, id=undefined) {
    this.parent = parent;
    this.id = id;
  }

  get box() {
    return this.parent.box;
  }
}
