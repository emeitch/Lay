export default class Thunk {
  constructor(f, ...args) {
    this.f = f;
    this.args = args;
  }

  apply(book, ...args) {
    this.args.forEach((arg, i) => {
      args.splice(i, 0, arg);
    });
    return this.f.apply(book, ...args);
  }
}

export function thunk(...args) {
  return new Thunk(...args);
}
