import Val from './val';
import { sym } from './sym';
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
    let p = prop;
    if (!p) {
      const tref = obj.getOwnProp("_proto");
      p = tref && tref.keyString().replace(/^(.)/, s => s.toLowerCase());
    }
    return new this.constructor(type, p, obj);
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
            sym("id"),
            prop,
            ["equals", target]
          )
        )
      ],
      k);
    return p.reduce(store);
  }
}
