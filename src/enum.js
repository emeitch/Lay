import Val from './val';
import Obj from './obj';
import v from './v';

export default class Enum extends Val {
  _onPutByProto(_id) {
    const protoname = this.get("_proto");
    if (!protoname.equals(v("Enum"))) {
      throw "should not specify external enum as _proto";
    }

    let clone = this.clone();
    return this.keys.reduce((a, key) => {
      const child = this.getOriginProp(key);
      if (Val.isConstantJSString(key) && child instanceof Obj && !child.getOriginProp("_proto")) {
        return a.patch({
          [key]: child.patch({
            _proto: _id
          })
        });
      } else {
        return a;
      }
    }, clone);
  }
}
