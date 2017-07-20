export default class Val {
  constructor(origin) {
    this.origin = origin;
  }

  reduce(_ctx) {
    return this;
  }

  toJSON() {
    return JSON.stringify(this.origin);
  }
}

export function v(origin) {
  return new Val(origin);
}
