import Val from './val';
import { sym } from './sym';
import { path } from './path';
import { func } from './func';

export default class Many extends Val {
  constructor(proto, prop, target) {
    super({
      proto,
      prop,
      target
    });
  }

  replaceSelfBy(obj) {
    const {proto, prop} = this.origin;
    let p = prop;
    if (!p) {
      const tref = obj.getOwnProp("_proto");
      p = tref && tref.keyString().replace(/^(.)/, s => s.toLowerCase());
    }
    return new this.constructor(proto, p, obj);
  }

  get(k, store) {
    const {proto, prop, target} = this.origin;
    const p = path(
      proto,
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
