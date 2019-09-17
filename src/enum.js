import Val from './val';
import Obj from './obj';
import v from './v';

export default class Enum extends Val {
  _onPutByProto() {
    const protoname = this.get("_proto");
    if (!protoname.equals(v("Enum"))) {
      throw "should not specify external enum as _proto";
    }

    const parent = this.get("_id");

    let newObj = this.clone();
    for (const key of this.keys) {
      const child = this.get(key);
      const isConst = key[0].match(/[A-Z]/);
      if (isConst && child instanceof Obj && !child.getOriginProperty("_proto")) {
        const c = child.patch({
          _proto: parent
        });
        newObj = newObj.patch({
          [key]: c
        });
      }
    }

    return newObj;
  }
}
