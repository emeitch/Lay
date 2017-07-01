import Val from './val';

export default class Ref extends Val {
  toJSON() {
    return this.toString();
  }
}
