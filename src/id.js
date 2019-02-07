import Val from './val';

export default class ID extends Val {
  get reducible() {
    return false;
  }

  stringify(_indent) {
    return this.prefix() + this.origin;
  }

  step(store) {
    return store.resolve(this);
  }
}
