import Val from './val';
import Obj from './obj';
import v from './v';

export default class Enum extends Val {
  _onPutByProto(_id) {
    const protoname = this.get("_proto");
    if (!protoname.equals(v("Enum"))) {
      throw "should not specify external enum as _proto";
    }

    let newObj = this.clone();
    return this.keys.reduce((a, key) => {
      const child = this.getOriginProperty(key);
      const isConst = key[0].match(/[A-Z]/);
      if (isConst && child instanceof Obj && !child.getOriginProperty("_proto")) {
        return a.patch({
          [key]: child.patch({
            _proto: _id
          })
        });
      } else {
        return a;
      }
    }, newObj);
  }
}
