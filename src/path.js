import Val from './val';
import Prim from './prim';
import Case from './case';
import v from './v';
import Sym from './sym';
import { exp } from './exp';
import { func, LiftedNative } from './func';

export default class Path extends Val {
  constructor(...nodes) {
    const origin = [];
    nodes.forEach((node, index) => {
      const id = node.getOwnProp && node.getOwnProp("_id");
      if (id) {
        const pth = Path.parse(id);
        origin.push(...pth.origin);
      } else if (typeof(node) === "string") {
        origin.push([v(node)]);
      } else if (Array.isArray(node)) {
        const applying = node.map(i => v(i));
        const val = index === 0 && node.length > 1 ? exp(...node) : applying;
        origin.push(val);
      } else if (node instanceof Val && node.isUUID()) {
        origin.push([node]);
      } else {
        origin.push(node);
      }
    });
    super(origin);
  }

  static parse(str) {
    const s = v(str);
    const keys = s.keyString().split(".");
    return keys.length > 1 ? path(...keys) : path(s);
  }

  get receiver() {
    const [receiver,] = this.origin;
    const r = Array.isArray(receiver) && receiver.length == 1 ? receiver[0] : receiver;
    return r;
  }

  get keys() {
    const [, ...keys] = this.origin;
    return keys;
  }

  get tail() {
    const tail = this.origin[this.origin.length - 1];
    const t = Array.isArray(tail) && tail.length == 1 ? tail[0] : tail;
    return t;
  }

  get _tail() {
    return this.tail;
  }

  isMultiple() {
    return this.keys.length > 0;
  }

  isPartial() {
    return this.isMultiple() && this.keys.every(i => Array.isArray(i) ? i[0] instanceof Prim && !i[0].isUUID() : i instanceof Prim && !i.isUUID());
  }

  isInner() {
    return this.isMultiple() && this.keys.every(i => Array.isArray(i) ? i[0].isUUID(): i.isUUID());
  }

  stringify(indent=0) {
    return "Path " + Val.stringify(this.origin, indent);
  }

  keyString() {
    if (this.origin.some(i => i instanceof Sym)) {
      throw "cannot contains a Sym value";
    }

    if (this.origin.some(i => typeof(i.origin) === "number" && i.origin % 1 !== 0)) {
      throw "cannot contains a float number value";
    }

    if (this.origin.some(i => Array.isArray(i) && i.length > 1)) {
      throw "cannot contains a method calling";
    }

    return this.origin.map(i => Array.isArray(i) ? i[0].keyString() : i.keyString()).join(".");
  }

  get(key, store) {
    return super.get(key, store) || store.findPropFromStereotype(this, key);
  }

  replace(matches) {
    return new this.constructor(...this.origin.map(id => Array.isArray(id) ? id.map(i => i.replace(matches)) : id.replace(matches)));
  }

  step(store) {
    let obj = store;
    for (const elm of this.origin) {
      const [kexp, ...args] = Array.isArray(elm) ? elm : [elm];
      const key = kexp.reduce(store);

      if (obj.unpack) {
        obj = obj.unpack();
      }

      let prop = obj.get(key, store);
      if (prop === undefined) {
        return this;
      }

      if (prop instanceof Function) {
        // LiftedNativeの基本仕様はthisでstoreを渡すだが
        // 組み込みのメソッドの場合、thisで自身を参照したいケースが大半で
        // storeを渡すわけにいかないので、自身の値をbindする
        const f = prop.bind(obj);
        const nf = (...args) => {
          const as = args.map(a => a.reduce(store));
          if (as.some(a => a.reducible)) {
            return exp(new LiftedNative(nf), ...as);
          }

          return f(...as);
        };
        prop = func(new LiftedNative(nf));
      }

      const innerPath = path(obj, key);
      if (prop.equals(innerPath)) {
        obj = prop;
      } else if (prop instanceof Case) {
        const c = prop.replaceSelfBy(obj);
        const as = args.map(a => a.replaceSelfBy(obj));
        const e = exp(c, ...as);
        obj = e.reduce(store).replaceSelfBy(obj);
      } else {
        const replaced = prop.replaceSelfBy(obj);
        obj = replaced.reduce(store);
      }
    }

    return obj;
  }

  object(store) {
    const base = super.object(store);
    return Object.assign({}, base, {
      origin: this.origin.map(o => {
        if (Array.isArray(o)) {
          return o.map(i => i.object(store));
        } else {
          return o.object(store);
        }
      })
    });
  }

  diff(leaf) {
    const keys = this.keys.concat();
    keys.reverse();
    const lf = Object.assign({}, leaf.origin);
    return keys.reduce((a, key) => {
      const k = Array.isArray(key) ? key[0] : key;
      return {[k.keyString()]: a};
    }, lf);
  }

  parent() {
    // todo: keysが空なら親は存在しなのでエラーにする
    const keys = this.keys.concat();
    keys.pop(); // remove child
    return new Path(this.receiver, ...keys);
  }
}

export function path(...args) {
  return new Path(...args);
}
