import Val from './val';

export default class Sym extends Val {
  reduce(env) {
    return env.resolve(this.origin);
  }

  collate(val) {
    return {
      it: val,
      [this.origin]: val
    };
  }
}
