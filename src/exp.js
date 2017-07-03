import Val from './val';

export default class Exp {
  constructor(...terms) {
    this.terms = terms;
  }

  reduce() {
    const [func, ...args] = this.terms;
    if (args.every((arg) => arg.constructor === Val)) {
      return func.apply(...args);
    }

    return this;
  }
}

class Func {
}

export class Plus extends Func {
  apply(...args) {
    const [fst, snd] = args;
    return new Val(fst.origin + snd.origin);
  }
}
