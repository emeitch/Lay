import Val from './val';
import Obj from './obj';

export default class Enum extends Val {
  onPutByProto(obj) {
    const parent = obj.get("_id");

    let newObj = obj.clone();
    for (const key of obj.keys) {
      const child = obj.get(key);
      if (key[0].match(/[A-Z]/) && child instanceof Obj) {
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
