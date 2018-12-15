import Ref from './ref';

export default class ID extends Ref {
  get reducible() {
    return false;
  }

  stringify(_indent) {
    return this.prefix() + this.origin;
  }

  getOwnProp(key, store) {
    return store && store.getOwnProp(this, key) || super.getOwnProp(key, store);
  }

  get(key, store) {
    return store && store.getProp(this, key) || super.get(key, store);
  }
}
