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
  std.assign("if", func(
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

  std.assign("load", func(new LiftedNative((store) => {
    return new Act(objsStr => {
      const jsobj = objsStr ? JSON.parse(objsStr) : [];
      const objs = parseObjs(jsobj);
      for (const obj of objs) {
        store.putWithoutHandler(obj);
      }
      return v(objs);
    });
  })));


  std.assign("filterObjs", func("pattern", new LiftedNative((pattern, store) => {
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
  const val = std.create({
    _key: "Val",
  });

  std.set(
    val,
    "get",
    func("key", exp(new LiftedNative((self, key, store) => {
      return self.get(key, store);
    }), "self", "key"))
  );

  // todo: valに"set"を定義するのは汎用的すぎるので是正したい
  std.set(
    val,
    "set",
    func("key", "val", exp(new LiftedNative((self, key, val, store) => {
      return store.setAct(self, key.reduce(store), val.reduce(store));
    }), "self", "key", "val"))
  );
}

{
  const entity = std.create({
    _key: "Entity"
  });

  std.set(
    entity,
    "create",
    func("props", new LiftedNative((pe, store) => {
      return new Act(() => {
        const props = pe.reduce(store);
        // todo: 本当はpの加工をしなくても良いようにしたい
        const p = {};
        for (const key in props.origin) {
          p[key] = props.get(key);
        }
        return store.create(p);
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
    exp(new LiftedNative((self, store) => {
      return v(store.instanceIDs(self));
    }), "self")
  );

  std.set(
    entity,
    "delete",
    exp(new LiftedNative((self, store) => {
      return store.deleteAct(self);
    }), "self")
  );
}

{
  const str = std.create({
    _key: "String"
  });

  std.set(
    str,
    "trim",
    exp(new LiftedNative((self, _store) => {
      return v(self.origin.trim());
    }), "self")
  );
}

{
  const bool = std.create({
    _key: "Boolean"
  });

  std.set(
    bool,
    "not",
    exp(new LiftedNative((self, _store) => {
      return v(!self.origin);
    }), "self")
  );
}

{
  const arr = std.create({
    _key: "Arr"
  });

  std.set(
    arr,
    "new",
    func(new LiftedNative((...args) => {
      /* const store = */ args.pop();
      const items = args;

      const o = [];
      while(items.length > 0) {
        const val = args.shift();
        o.push(val instanceof Prim ? val.origin : val);
      }
      return new Arr(o);
    }))
  );

  std.set(
    arr,
    "map",
    func("fnc", exp(new LiftedNative((self, fnc, store) => {
      const arr = self;
      const narr = arr.origin.map(o => {
        const e = exp(fnc, v(o));
        return e.reduce(store);
      });
      return v(narr);
    }), "self", "fnc"))
  );

  std.set(
    arr,
    "every",
    func("fnc", exp(new LiftedNative((self, fnc, store) => {
      const arr = self;
      const result = arr.origin.every(o => {
        const e = exp(fnc, v(o));
        const val = e.reduce(store);
        return !(val instanceof Path) && val.origin;
      });
      return v(result);
    }), "self", "fnc"))
  );

  std.set(
    arr,
    "filter",
    func("fnc", exp(new LiftedNative((self, fnc, store) => {
      const arr = self;
      const narr = arr.origin.filter(o => {
        const e = exp(fnc, v(o));
        const val = e.reduce(store);
        return !(val instanceof Path) && val.origin;
      });
      return v(narr);
    }), "self", "fnc"))
  );

  std.set(
    arr,
    "count",
    exp(new LiftedNative((self, _store) => {
      return v(self.origin.length);
    }), "self")
  );

  std.set(
    arr,
    "join",
    func("sep", exp(new LiftedNative((self, sep, _store) => {
      return v(self.jsObj.join(sep.jsObj));
    }), "self", "sep"))
  );
}

{
  const o = std.create({
    _key: "Obj"
  });

  std.set(
    o,
    "new",
    func(new LiftedNative((...args) => {
      /* const store = */ args.pop();
      const protoSrc = args.shift();
      const protoName = protoSrc.equals(v(null)) ? undefined : protoSrc.origin;
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
  const act = std.create({
    _key: "Act"
  });

  std.set(
    act,
    "new",
    func("func", exp(new LiftedNative((self, func, store) => {
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
    func("next", exp(new LiftedNative((self, next, store) => {
      const act = self.reduce(store);
      const nact = next.reduce(store);
      return act.then(nact);
    }), "self", "next"))
  );
}

{
  const cnsl = std.create({
    _key: "Console"
  });

  std.set(
    cnsl,
    "puts",
    func("val", new LiftedNative((val, store) => {
      return new Act(() => {
        console.log(val.reduce(store).origin);
      });
    }))
  );
}

{
  const store = std.create({
    _key: "Store"
  });

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
    func("id", "key", "val", exp(new LiftedNative((self, id, key, val, store) => {
      return findAndDecorateStore(store, self, s => s.setAct(id, key, val));
    }), "self", "id", "key", "val"))
  );

  std.set(
    store,
    "importedStores",
    exp(new LiftedNative((self, store) => {
      return findAndDecorateStore(store, self, s => v(s.imports.map(i => i.id)));
    }), "self")
  );

  // todo: 本来は片方を参照して共通化したいが、うまく行かないのでJSレベルの値で共通化
  const generateStoreFunc = func("name", exp(new LiftedNative((self, name, store) => {
    const s = new Store();
    const n = name.reduce(store).origin;
    return new Act(() => {
      return store.import(s, n);
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
