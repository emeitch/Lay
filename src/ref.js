import Val from './val';

export default class Ref extends Val {
  stringify(_indent) {
    throw "Ref is abstruct class";
  }
}
