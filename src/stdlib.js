import v from './v';
import UUID from './uuid';
import Act from './act';
import Book from './book';
import Prim from './prim';
import { CompArray, CompMap } from  './comp';
import { sym } from './sym';
import { exp } from './exp';
import { func, LiftedNative } from './func';

export const stdlib = new Book();

{
  const obj = new UUID();
  stdlib.set("Object", obj);

  stdlib.put(
    obj,
    sym("set"),
    func("key", "val", new LiftedNative(function(key, val) {
      return this.putAct(this.get("self"), key, val);
    }))
  );

  // todo: allはClassオブジェクト用のメソッドにしたい
  stdlib.put(
    obj,
    sym("all"),
    func(new LiftedNative(function() {
      return v(this.taggedIDs(this.get("self")));
    }))
  );
}

{
  const arr = new UUID();
  stdlib.set("Array", arr);

  stdlib.put(
    arr,
    sym("new"),
    func(new LiftedNative(function(...args) {
      const head = args.shift();
      const o = [];
      while(args.length > 0) {
        const val = args.shift().reduce(this);
        // todo: 独自tagが設定されてない場合のみval.originに最適化したい
        o.push(val instanceof Prim ? val.origin : val);
      }
      return new CompArray(o, head);
    }))
  );

  stdlib.put(
    arr,
    sym("map"),
    func("fnc", new LiftedNative(function(fnc) {
      const arr = this.get("self");
      const narr = arr.origin.map(o => {
        const e = exp(fnc, v(o));
        return e.reduce(this);
      });
      return v(narr);
    }))
  );
}

{
  const map = new UUID();
  stdlib.set("Map", map);

  stdlib.put(
    map,
    sym("new"),
    func(new LiftedNative(function(...args) {
      const head = args.shift();
      const o = {};
      while(args.length > 0) {
        const key = args.shift();
        const val = args.shift().reduce(this);
        // todo: 独自tagが設定されてない場合のみval.originに最適化したい
        o[key.origin] = val instanceof Prim ? val.origin : val;
      }
      return new CompMap(o, head);
    }))
  );

  stdlib.put(
    map,
    sym("get"),
    func("key", new LiftedNative(function(key) {
      return this.get("self").get(key, this);
    }))
  );
}

{
  const act = new UUID();
  stdlib.set("Act", act);

  stdlib.put(
    act,
    sym("then"),
    func("a", new LiftedNative(function(a) {
      return this.get("self").then(a);
    }))
  );
}

{
  const log = new UUID();
  stdlib.set("Log", log);

  stdlib.put(
    log,
    sym("all"),
    func(new LiftedNative(function() {
      return v(this.logIDs());
    }))
  );
}

{
  const cnsl = new UUID();
  stdlib.set("Console", cnsl);

  stdlib.put(
    cnsl,
    sym("puts"),
    func("val", new LiftedNative(function(val) {
      return new Act(() => {
        console.log(val.origin);
      });
    }))
  );
}
