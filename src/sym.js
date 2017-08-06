import Val from './val';

import Env from './env';

export default class Sym extends Val {
  reduce(env) {
    return env.resolve(this.origin);
  }

  collate(val) {
    return new Env(undefined, undefined, {
      [this.origin]: val
    });
  }
}
