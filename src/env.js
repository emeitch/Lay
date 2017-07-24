export default class Env {
  constructor(parent=undefined, id=undefined) {
    this.parent = parent;
    this.id = id;
  }

  get box() {
    return this.parent.box;
  }
}
