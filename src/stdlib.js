import v from './v';
import UUID from './uuid';
import Act from './act';
import Book from './book';
import Prim from './prim';
import { CompArray, CompMap } from  './comp';
import { sym } from './sym';
import { exp } from './exp';
import { kase, alt, grd, otherwise } from './case';
import { func, LiftedNative } from './func';
import { path } from './path';

export const stdlib = new Book();

{
  stdlib.set("if", func(
    "cond",
    "then",
    "else",
    exp(
      kase(
        alt(
          "x",
          [
            grd(
              exp(func("x", x => x), "x"),
              "then"
            ),
            grd(
              otherwise,
              "else"
            )
          ]
        )
      ),
      "cond"
    )
  ));
}

{
  const obj = new UUID();
  stdlib.set("Object", obj);

  stdlib.put(
    obj,
    "new",
    func("props", new LiftedNative(function(pe) {
      return new Act(() => {
        const props = pe.reduce(this);
        // todo: 本当はpの加工をしなくても良いようにしたい
        const p = {};
        for (const key in props.origin) {
          p[key] = props.get(key);
        }
        this.new(p);
      });
    }))
  );

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
  const str = new UUID();
  stdlib.set("String", str);

  stdlib.put(
    str,
    sym("trim"),
    func(new LiftedNative(function() {
      return v(this.get("self").origin.trim());
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
      const hsrc = args.shift();
      const head = hsrc.equals(v(null)) ? undefined : hsrc;
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

  stdlib.put(
    arr,
    "filter",
    func("fnc", new LiftedNative(function(fnc) {
      const arr = this.get("self");
      const narr = arr.origin.filter(o => {
        const e = exp(fnc, v(o));
        return e.reduce(this).origin;
      });
      return v(narr);
    }))
  );

  stdlib.put(
    arr,
    sym("count"),
    func(new LiftedNative(function() {
      return v(this.get("self").origin.length);
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
      const hsrc = args.shift();
      const head = hsrc.equals(v(null)) ? undefined : hsrc;
      const o = {};
      while(args.length > 0) {
        const key = args.shift();
        const val = args.shift();
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

export function n(...args) {
  const origin = args.pop();
  const head = args.pop() || v(null);
  if (Array.isArray(origin)) {
    return path("Array", ["new", head].concat(origin));
  } else {
    const maparr = Object.keys(origin).reduce((r, k) => r.concat([k, origin[k]]), []);
    return path("Map", ["new", head].concat(maparr));
  }
}
