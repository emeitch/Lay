import Val from './val';

export default class Sym extends Val {
  reduce(env) {
    return env.resolve(this.origin);
  }

  collate(_val) {
    return true;
  }
}
