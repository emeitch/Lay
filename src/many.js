import Val from './val';
import { path } from './path';
import { func } from './func';

export default class Many extends Val {
  constructor(type, prop, target) {
    super({
      type,
      prop,
      target
    });
  }

  replaceSelfBy(obj) {
    const {type, prop} = this.origin;
    return new this.constructor(type, prop, obj);
  }

  get(k, store) {
    const {type, prop, target} = this.origin;
    const p = path(
      type,
      "all",
      [
        "filter",
        func(
          "id",
          path(
            "id",
            prop,
            ["equals", target]
          )
        )
      ],
      k);
    return p.reduce(store);
  }
}
