export default class Env {
  constructor(parent=undefined, id=undefined, bindings={}) {
    this.parent = parent;
    this.id = id;
    this.bindings = bindings;
  }

  get box() {
    return this.parent.box;
  }

  resolve(name) {
    const val = this.bindings[name];
    if (val) {
      return val;
    } else {
      return this.parent.resolve(name);
    }
  }
}
