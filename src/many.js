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
            "_id",
            ["equals", target]
          )
        )
      ],
      k);
    return p.reduce(store);
  }
}
