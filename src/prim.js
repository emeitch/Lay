import Val from './val';

export default class Prim extends Val {
  get id() {
    return this;
  }

  get reducible() {
    return false;
  }
}
