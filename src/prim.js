import Val from './val';

export default class Prim extends Val {
  get reducible() {
    return false;
  }
}
