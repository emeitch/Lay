import Val from './val';
import Prim from './prim';
import Case from './case';
import v from './v';
import Sym, { sym } from './sym';
import { exp } from './exp';
import { func, LiftedNative } from './func';

export default class Path extends Val {
  static isMethodCallingNode(node) {
    return Array.isArray(node);
  }

  static isMethodCallingWithArgsNode(node) {
    return this.isMethodCallingNode(node) && node.length > 1;
  }

  constructor(...nodes) {
    const origin = [];
    nodes.forEach((node, index) => {
      const id = node.getOwnProp && node.getOwnProp("_id");
      if (id) {
        const pth = Path.parse(id);
        origin.push(...pth.origin);
      } else if (typeof(node) === "string") {
        const val = node == "self" ? sym(node) : v(node);
        origin.push([val]);
      } else if (Path.isMethodCallingNode(node)) {
        const applying = node.map(i => v(i));
        const val = index === 0 && node.length > 1 ? exp(...node) : applying;
        origin.push(val);
      } else if (index > 1) {
        origin.push([node]);
      } else if (node.isPacked) {
        origin.push(node.unpack());
      } else if (node instanceof Prim && node.isUUID()) {
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
    return this.origin.map(i => Path.isMethodCallingNode(i) ? translateArray(i) : translateItem(i));
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

    if (this.origin.some(i => Path.isMethodCallingWithArgsNode(i))) {
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
      const isMethodCalling = Path.isMethodCallingNode(elm);
      const [kexp, ...args] = isMethodCalling ? elm : [elm];
      const key = kexp.reduce(store);

      if (obj.unpack) {
        obj = obj.unpack();
      }

      const gettingProp = obj !== store || (isMethodCalling && key.protoName == "String");
      let prop = gettingProp ? obj.get(key, store) : key;
      if (prop === undefined) {
        return this;
      }

      if (prop instanceof Function) {
        // LiftedNativeの基本仕様はthisでstoreを渡すだが
        // 組み込みのメソッドの場合、thisで自身を参照したいケースが大半で
        // storeを渡すわけにいかないので、自身の値をbindする
        const f = prop;
        const boundf = f.bind(obj);
        const nativef = (...args) => {
          const reducedargs = args.map(a => a.reduce(store));
          return boundf(...reducedargs);
        };
        prop = func(new LiftedNative(nativef));
      }

      const innerPath = path(obj, key);
      if (prop.equals(innerPath)) {
        obj = prop;
      } else if (prop instanceof Case) {
        const c = prop.replaceSelfBy(obj);
        const e = exp(c, ...args);
        obj = e.reduce(store).replaceSelfBy(obj);
      } else {
        const replaced = prop.replaceSelfBy(obj);
        obj = replaced.reduce(store);
        if (obj instanceof Path && obj.equals(replaced)) {
          obj = prop;
        }
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
    const messages = this.messageKeysWithTranslation(a => a[0]);
    messages.reverse();
    const lf = Object.assign({}, leaf.origin);
    return messages.reduce((a, k) => {
      return {[k.keyString()]: a};
    }, lf);
  }

  parent() {
    // todo: messagesが空なら親は存在しなのでエラーにする
    const messages = this.messages;
    messages.pop(); // remove child
    return new Path(this.receiver, ...messages);
  }

  child(key) {
    return new Path(...this.origin.concat(key));
  }
}

export function path(...args) {
  return new Path(...args);
}
