export default class Env {
  constructor(parent=undefined, id=undefined, bindings={}) {
    this.parent = parent;
    this.id = id;
    this.bindings = bindings;
  }

  get book() {
    return this.parent.book;
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
