export default class Val {
  constructor(origin) {
    this.origin = origin;
  }

  toJSON() {
    return JSON.stringify(this.origin);
  }
}

export function v(origin) {
  return new Val(origin);
}