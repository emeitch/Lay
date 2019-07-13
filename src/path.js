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
      } else if (index > 1) {
        origin.push([node]);
      } else if (node instanceof Val && node.isUUID()) {
        // todo: このままだとuuidの文字列を加工できなくなってしまうので修正が必要
        origin.push([node]);
      } else {
        origin.push(node);
      }
    });
    super(origin);
  }

  static parse(str) {
    const s = v(str);
    const messages = s.keyString().split(".");
    return path(...messages);
  }

  keysWithTranslation(translateArray, translateItem = i => i) {
    return this.origin.map(i => Array.isArray(i) ? translateArray(i) : translateItem(i));
  }

  messagesFromChain(chain) {
    const [, ...messages] = chain;
    return messages;
  }

  messageKeysWithTranslation(translateArray, translateItem) {
    const keys = this.keysWithTranslation(translateArray, translateItem);
    return this.messagesFromChain(keys);
  }

  get keys() {
    return this.keysWithTranslation(a => a[0]);
  }

  get receiver() {
    return this.keys[0];
  }

  get messages() {
    return this.messagesFromChain(this.origin);
  }

  get tail() {
    const keys = this.keys;
    return keys[keys.length - 1];
  }

  get _tail() {
    return this.tail;
  }

  isMultiple() {
    return this.messages.length > 0;
  }

  isPartial() {
    return this.isMultiple() && this.keys.every((k, i) => i == 0 || (k instanceof Prim && !k.isUUID()));
  }

  isInner() {
    return this.isMultiple() && this.keys.every((k, i) => i == 0 || k.isUUID());
  }

  stringify(indent=0) {
    return "Path " + Val.stringify(this.origin, indent);
  }

  keyString() {
    if (this.origin.some(i => i instanceof Sym)) {
      throw "cannot contains a Sym value";
    }

    const isFloatNumber = k => typeof(k.origin) === "number" && k.origin % 1 !== 0;
    if (this.keys.some(isFloatNumber)) {
      throw "cannot contains a float number value";
    }

    if (this.origin.some(i => Array.isArray(i) && i.length > 1)) {
      throw "cannot contains a method calling";
    }

    return this.keys.map(k => k.keyString()).join(".");
  }

  get(key, store) {
    return super.get(key, store) || store.findPropFromStereotype(this, key);
  }

  replace(matches) {
    const mapper = i => i.replace(matches);
    const args = this.keysWithTranslation(a => a.map(mapper), mapper);
    return new this.constructor(...args);
  }

  step(store) {
    let obj = store;
    for (const elm of this.origin) {
      const isMessage = Array.isArray(elm);
      const [kexp, ...args] = isMessage ? elm : [elm];
      const key = kexp.reduce(store);

      if (obj.unpack) {
        obj = obj.unpack();
      }

      const isPrimReceiver = !isMessage && obj === store;
      let prop = isPrimReceiver ? key : obj.get(key, store);
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
    const mapper = i => i.object(store);
    return Object.assign({}, base, {
      origin: this.keysWithTranslation(
        a => a.map(mapper),
        mapper
      )
    });
  }

  diff(leaf) {
    const messages = this.messageKeysWithTranslation(a => a[0]).concat();
    messages.reverse();
    const lf = Object.assign({}, leaf.origin);
    return messages.reduce((a, k) => {
      return {[k.keyString()]: a};
    }, lf);
  }

  parent() {
    // todo: messagesが空なら親は存在しなのでエラーにする
    const messages = this.messages.concat();
    messages.pop(); // remove child
    return new Path(this.receiver, ...messages);
  }
}

export function path(...args) {
  return new Path(...args);
}
