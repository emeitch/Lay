export default class Ctx {
  constructor(parent=undefined, id=undefined) {
    this.parent = parent;
    this.id = id;
  }

  get env() {
    return this.parent.env;
  }
}
