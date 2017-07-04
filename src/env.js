export default class Env {
  constructor(id=undefined, parent=undefined) {
    this.id = id;
    this.parent = parent;
  }

  activeLog(...args) {
    return this.parent.activeLog(...args);
  }
}
