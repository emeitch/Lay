export default class Key {
  constructor(...path) {
    this.path = path;
  }

  toString() {
    return this.path.join("/");
  }
}