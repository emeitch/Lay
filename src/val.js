export default class Val {
  constructor(origin) {
    this.origin = origin;
  }

  toJSON() {
    return JSON.stringify(this.origin);
  }
}