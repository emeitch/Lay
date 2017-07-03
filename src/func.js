import Val from './val';

export default class Func {
}

export class Plus extends Func {
  apply(...args) {
    const [fst, snd] = args;
    return new Val(fst.origin + snd.origin);
  }
}
