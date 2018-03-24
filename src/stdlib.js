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
    func("key", "val", exp(new LiftedNative(function(self, key, val) {
      return this.putAct(self, key, val);
    }), "self", "key", "val"))
  );

  // todo: allはClassオブジェクト用のメソッドにしたい
  stdlib.put(
    obj,
    sym("all"),
    exp(new LiftedNative(function(self) {
      return v(this.taggedIDs(self));
    }), "self")
  );
}

{
  const str = new UUID();
  stdlib.set("String", str);

  stdlib.put(
    str,
    sym("trim"),
    exp(new LiftedNative(function(self) {
      return v(self.origin.trim());
    }), "self")
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
        const val = args.shift();
        // todo: 独自tagが設定されてない場合のみval.originに最適化したい
        o.push(val instanceof Prim ? val.origin : val);
      }
      return new CompArray(o, head);
    }))
  );

  stdlib.put(
    arr,
    sym("map"),
    func("fnc", exp(new LiftedNative(function(self, fnc) {
      const arr = self;
      const narr = arr.origin.map(o => {
        const e = exp(fnc, v(o));
        return e.reduce(this);
      });
      return v(narr);
    }), "self", "fnc"))
  );

  stdlib.put(
    arr,
    sym("every"),
    func("fnc", exp(new LiftedNative(function(self, fnc) {
      const arr = self;
      const result = arr.origin.every(o => {
        const e = exp(fnc, v(o));
        return e.reduce(this).origin;
      });
      return v(result);
    }), "self", "fnc"))
  );

  stdlib.put(
    arr,
    "filter",
    func("fnc", exp(new LiftedNative(function(self, fnc) {
      const arr = self;
      const narr = arr.origin.filter(o => {
        const e = exp(fnc, v(o));
        return e.reduce(this).origin;
      });
      return v(narr);
    }), "self", "fnc"))
  );

  stdlib.put(
    arr,
    sym("count"),
    exp(new LiftedNative(function(self) {
      return v(self.origin.length);
    }), "self")
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
    func("key", exp(new LiftedNative(function(self, key) {
      return self.get(key, this);
    }), "self", "key"))
  );
}

{
  const act = new UUID();
  stdlib.set("Act", act);

  stdlib.put(
    act,
    sym("then"),
    func("next", exp(new LiftedNative(function(self, next) {
      const act = self.deepReduce(this);
      return act.then(next);
    }), "self", "next"))
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
        console.log(val.deepReduce(this).origin);
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
