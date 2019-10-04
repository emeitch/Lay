import Val from './val';
import v from './v';
import Act from './act';
import Store from './store';
import Prim from './prim';
import Path from './path';
import Obj from './obj';
import Arr from './arr';
import { exp } from './exp';
import { kase, alt, grd, otherwise } from './case';
import { func, LiftedNative } from './func';
import { path } from './path';
import { parseObjs } from './parser';

export const std = new Store();

{
  std.set("if", "_body", func(
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

  std.set("load", "_body", func(new LiftedNative(function() {
    const store = this;
    return new Act(objsStr => {
      const jsobj = objsStr ? JSON.parse(objsStr) : [];
      const objs = parseObjs(jsobj);
      for (const obj of objs) {
        store.putWithoutHandler(obj);
      }
      return v(objs);
    });
  })));


  std.set("filterObjs", "_body", func("pattern", new LiftedNative(function(pattern) {
    const store = this;
    const protoPattern = pattern.reduce(store).origin;
    return new Act(objs => {
      const filtered = [];
      const transactions = [];
      for (const obj of objs) {
        const protoName = obj.get("_proto", store);
        const protoStr = protoName.keyString();
        if (protoPattern.includes(protoStr)) {
          filtered.push(obj);
        }

        if (protoStr === "Revision") {
          transactions.push(obj);
        }
      }

      const txs = transactions.filter(tx => filtered.some(f => tx.getOwnProp("_id").equals(f.getOwnProp("_rev").keyVal())));
      return txs.concat(filtered);
    });
  })));
}

{
  const val = "Val";

  std.set(
    val,
    "get",
    func("key", exp(new LiftedNative(function(self, key) {
      return self.get(key, this);
    }), "self", "key"))
  );

  // todo: valに"set"を定義するのは汎用的すぎるので是正したい
  std.set(
    val,
    "set",
    func("key", "val", exp(new LiftedNative(function(self, key, val) {
      return this.setAct(self, key.reduce(this), val.reduce(this));
    }), "self", "key", "val"))
  );
}

{
  const entity = "Entity";

  std.set(
    entity,
    "create",
    func("props", new LiftedNative(function(pe) {
      return new Act(() => {
        const props = pe.reduce(this);
        // todo: 本当はpの加工をしなくても良いようにしたい
        const p = {};
        for (const key in props.origin) {
          p[key] = props.get(key);
        }
        return this.create(p);
      });
    }))
  );

  std.set(
    entity,
    "_status",
    v("active")
  );

  // todo: allはClassオブジェクト用のメソッドにしたい
  std.set(
    entity,
    "all",
    exp(new LiftedNative(function(self) {
      return v(this.instanceIDs(self));
    }), "self")
  );

  std.set(
    entity,
    "delete",
    exp(new LiftedNative(function(self) {
      return this.deleteAct(self);
    }), "self")
  );
}

{
  const str = "String";

  std.set(
    str,
    "trim",
    exp(new LiftedNative(function(self) {
      return v(self.origin.trim());
    }), "self")
  );
}

{
  const bool = "Boolean";

  std.set(
    bool,
    "not",
    exp(new LiftedNative(function(self) {
      return v(!self.origin);
    }), "self")
  );
}

{
  const arr = "Arr";

  std.set(
    arr,
    "new",
    func(new LiftedNative(function(...args) {
      const o = [];
      while(args.length > 0) {
        const val = args.shift();
        o.push(val instanceof Prim ? val.origin : val);
      }
      return new Arr(o);
    }))
  );

  std.set(
    arr,
    "map",
    func("fnc", exp(new LiftedNative(function(self, fnc) {
      const arr = self;
      const narr = arr.origin.map(o => {
        const e = exp(fnc, v(o));
        return e.reduce(this);
      });
      return v(narr);
    }), "self", "fnc"))
  );

  std.set(
    arr,
    "every",
    func("fnc", exp(new LiftedNative(function(self, fnc) {
      const arr = self;
      const result = arr.origin.every(o => {
        const e = exp(fnc, v(o));
        const val = e.reduce(this);
        return !(val instanceof Path) && val.origin;
      });
      return v(result);
    }), "self", "fnc"))
  );

  std.set(
    arr,
    "filter",
    func("fnc", exp(new LiftedNative(function(self, fnc) {
      const arr = self;
      const narr = arr.origin.filter(o => {
        const e = exp(fnc, v(o));
        const val = e.reduce(this);
        return !(val instanceof Path) && val.origin;
      });
      return v(narr);
    }), "self", "fnc"))
  );

  std.set(
    arr,
    "count",
    exp(new LiftedNative(function(self) {
      return v(self.origin.length);
    }), "self")
  );

  std.set(
    arr,
    "join",
    func("sep", exp(new LiftedNative(function(self, sep) {
      return v(self.jsObj.join(sep.jsObj));
    }), "self", "sep"))
  );
}

{
  const o = "Obj";

  std.set(
    o,
    "new",
    func(new LiftedNative(function(...args) {
      const protoSrc = args.shift();
      const protoName = protoSrc.equals(v(null)) ? undefined : v(protoSrc.origin);
      const o = {};
      while(args.length > 0) {
        if (args.length === 1) {
          throw "short arguments error";
        }
        const key = args.shift();
        const val = args.shift();
        o[key.origin] = val instanceof Prim ? val.origin : val;
      }
      return new Obj(o, protoName);
    }))
  );
}

{
  const act = "Act";

  std.set(
    act,
    "new",
    func("func", exp(new LiftedNative(function(self, func) {
      const store = this;
      return new Act(arg => {
        if (!arg) {
          return func;
        }

        return exp(func, arg).reduce(store);
      });
    }), "self", "func"))
  );

  std.set(
    act,
    "then",
    func("next", exp(new LiftedNative(function(self, next) {
      const act = self.reduce(this);
      const nact = next.reduce(this);
      return act.then(nact);
    }), "self", "next"))
  );
}

{
  const cnsl = "Console";

  std.set(
    cnsl,
    "puts",
    func("val", new LiftedNative(function(val) {
      return new Act(() => {
        console.log(val.reduce(this).origin);
      });
    }))
  );
}

{
  const store = "Store";

  const findAndDecorateStore = (baseStore, targetStore, decorate) => {
    for (const i of baseStore.imports) {
      if (i.id.keyVal().equals(targetStore.getOwnProp("_id"))) {
        return decorate(i);
      }
    }

    return decorate(baseStore);
  };

  std.set(
    store,
    "set",
    func("id", "key", "val", exp(new LiftedNative(function(self, id, key, val) {
      return findAndDecorateStore(this, self, s => s.setAct(id, key, val));
    }), "self", "id", "key", "val"))
  );

  std.set(
    store,
    "importedStores",
    exp(new LiftedNative(function(self) {
      return findAndDecorateStore(this, self, s => v(s.imports.map(i => i.id)));
    }), "self")
  );

  // todo: 本来は片方を参照して共通化したいが、うまく行かないのでJSレベルの値で共通化
  const generateStoreFunc = func("name", exp(new LiftedNative(function(self, name) {
    const s = new Store();
    const n = name.reduce(this).origin;
    return new Act(() => {
      return this.import(s, n);
    });
  }), "self", "name"));

  std.set(
    store,
    "generateAs",
    generateStoreFunc
  );

  std.set(
    store,
    "generateStoreAs",
    generateStoreFunc
  );
}

export function n(...args) {
  const origin = args.pop();
  if (Array.isArray(origin)) {
    return path("Arr", ["new"].concat(origin));
  } else if (origin instanceof Object && !(origin instanceof Val)) {
    const protoSrc = args.pop();
    const protoName = protoSrc ? v(protoSrc) : v(null);
    const maparr = Object.keys(origin).reduce((r, k) => {
      const o = origin[k];
      const val = o instanceof Val || typeof(o) === "string" ? o : v(o);
      return r.concat([k, val]);
    }, []);
    return path("Obj", ["new", protoName].concat(maparr));
  } else {
    throw "not Arr or Obj args pattern";
  }
}
