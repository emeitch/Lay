import Val from './val';
import Prim from './prim';
import Case from './case';
import v from './v';
import Sym from './sym';
import { exp } from './exp';
import { func, LiftedNative } from './func';

export default class Path extends Val {
  constructor(...nodes) {
    let origin = [];
    let toStartReducingFromStore = false;
    nodes.forEach((node, index) => {
      const id = node.getOwnProp && node.getOwnProp("_id");
      if (id) {
        const pth = Path.parse(id);
        origin.push(...pth.origin);
        toStartReducingFromStore = (index === 0) && pth.toStartReducingFromStore || toStartReducingFromStore;
      } else if (typeof(node) === "string") {
        origin.push(v(node));
        toStartReducingFromStore = (index === 0) || toStartReducingFromStore;
      } else if (Array.isArray(node)) {
        const applying = node.map(i => v(i));
        const val = index === 0 ? exp(...node) : applying;
        origin.push(val);
      } else if (node instanceof Val && node.isUUID()) {
        origin.push(node);
        toStartReducingFromStore = (index === 0) || toStartReducingFromStore;
      } else {
        origin.push(node);
      }
    });
    super(origin);

    this.toStartReducingFromStore = toStartReducingFromStore;
  }

  static parse(str) {
    const s = v(str);
    const keys = s.keyString().split(".");
    return keys.length > 1 ? path(...keys) : path(s);
  }

  get receiver() {
    const [receiver,] = this.origin;
    return receiver;
  }

  get keys() {
    const [, ...keys] = this.origin;
    return keys;
  }

  get tail() {
    return this.origin[this.origin.length - 1];
  }

  get _tail() {
    return this.tail;
  }

  isMultiple() {
    return this.keys.length > 0;
  }

  isPartial() {
    return this.isMultiple() && this.keys.every(i => i instanceof Prim && !i.isUUID());
  }

  isInner() {
    return this.isMultiple() && this.keys.every(i => i.isUUID());
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

    if (this.origin.some(i => Array.isArray(i))) {
      throw "cannot contains a method calling";
    }

    return this.origin.map(i => i.keyString()).join(".");
  }

  get(key, store) {
    return super.get(key, store) || store.findPropFromStereotype(this, key);
  }

  replace(matches) {
    return new this.constructor(...this.origin.map(id => Array.isArray(id) ? id.map(i => i.replace(matches)) : id.replace(matches)));
  }

  step(store) {
    // let obj = this.toStartReducingFromStore ? store : this.receiver.reduce(store);
    let obj = store;

    // const keys = this.toStartReducingFromStore ? this.origin : this.keys;
    const keys = this.origin;

    for (const elm of keys) {
      let key;
      let args = [];
      if (Array.isArray(elm)) {
        const [top, ...rest] = elm;
        key = top;
        args = rest;
      } else {
        key = elm;
      }
      key = key.reduce(store);

      if (obj && obj.unpack) {
        obj = obj.unpack();
      }

      let prop = obj ? obj.get(key, store) : key;
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

      const innerPath = obj ? path(obj, key) : path(key);
      if (!obj || prop.equals(innerPath)) {
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
    return keys.reduce((a, c) => {
      return {[c.keyString()]: a};
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
