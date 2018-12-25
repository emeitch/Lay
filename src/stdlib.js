import Val from './val';
import v from './v';
import UUID from './uuid';
import Act from './act';
import Store from './store';
import Prim from './prim';
import Comp, { CompArray, CompMap } from  './comp';
import { exp } from './exp';
import { kase, alt, grd, otherwise } from './case';
import { func, LiftedNative } from './func';
import { path } from './path';
import { parseObjs } from './store';

export const std = new Store();

function set(...args) {
  std.set(...args);
}

function put(id, key, val) {
  const comp = std.get(id) || v({});
  std.set(id, Object.assign({}, comp.origin, {[key]: val}));
}

{
  set("if", func(
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

  std.set("load", func(new LiftedNative(function() {
    const store = this;
    return new Act(objsStr => {
      const jsobj = objsStr ? JSON.parse(objsStr) : [];
      const objs = parseObjs(jsobj);
      for (const obj of objs) {
        store.putWithoutHandler(obj);
      }
    });
  })));


  std.set("filterPiars", func("pattern", new LiftedNative(function(pattern) {
    const store = this;
    const types = pattern.deepReduce(store).origin;
    return new Act(pairs => {
      const filtered = [];
      for (const pair of pairs) {
        const typename = pair.val.get("type").origin[0].origin;
        if (types.includes(typename)) {
          filtered.push(pair);
        }
      }
      return filtered;
    });
  })));
}

{
  const obj = "Object";

  put(
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
        return this.new(p);
      });
    }))
  );

  put(
    obj,
    "set",
    func("key", "val", exp(new LiftedNative(function(self, key, val) {
      return this.setAct(self, key.reduce(this), val.reduce(this));
    }), "self", "key", "val"))
  );

  put(
    obj,
    "get",
    func("key", exp(new LiftedNative(function(self, key) {
      return this.getProp(self, key);
    }), "self", "key"))
  );

  // todo: allはClassオブジェクト用のメソッドにしたい
  put(
    obj,
    "all",
    exp(new LiftedNative(function(self) {
      return v(this.instanceIDs(self));
    }), "self")
  );
}

{
  const str = "String";

  put(
    str,
    "trim",
    exp(new LiftedNative(function(self) {
      return v(self.origin.trim());
    }), "self")
  );
}

{
  const bool = "Boolean";

  put(
    bool,
    "not",
    exp(new LiftedNative(function(self) {
      return v(!self.origin);
    }), "self")
  );
}

{
  const comp = "Comp";

  put(
    comp,
    "new",
    func(new LiftedNative(function(...args) {
      const head = args.shift();
      const origin = args.shift() || null;
      return new Comp(origin, head);
    }))
  );
}

{
  const arr = "Array";

  put(
    arr,
    "new",
    func(new LiftedNative(function(...args) {
      const hsrc = args.shift();
      const head = hsrc.equals(v(null)) ? undefined : v(hsrc.origin);
      const o = [];
      while(args.length > 0) {
        const val = args.shift();
        o.push(val instanceof Prim ? val.origin : val);
      }
      return new CompArray(o, head);
    }))
  );

  put(
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

  put(
    arr,
    "every",
    func("fnc", exp(new LiftedNative(function(self, fnc) {
      const arr = self;
      const result = arr.origin.every(o => {
        const e = exp(fnc, v(o));
        return e.reduce(this).origin;
      });
      return v(result);
    }), "self", "fnc"))
  );

  put(
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

  put(
    arr,
    "count",
    exp(new LiftedNative(function(self) {
      return v(self.origin.length);
    }), "self")
  );

  put(
    arr,
    "join",
    func("sep", exp(new LiftedNative(function(self, sep) {
      const arr = self.deepReduce(this);
      const s = sep.deepReduce(this);
      return v(arr.jsObj.join(s.jsObj));
    }), "self", "sep"))
  );
}

{
  const map = "Map";

  put(
    map,
    "new",
    func(new LiftedNative(function(...args) {
      const hsrc = args.shift();
      const head = hsrc.equals(v(null)) ? undefined : v(hsrc.origin);
      const o = {};
      while(args.length > 0) {
        if (args.length == 1) {
          throw "short arguments error";
        }
        const key = args.shift();
        const val = args.shift();
        o[key.origin] = val instanceof Prim ? val.origin : val;
      }
      return new CompMap(o, head);
    }))
  );
}

// {
//   const date = new UUID();
//   set("Date", date);
// }

{
  const act = "Act";

  put(
    act,
    "then",
    func("next", exp(new LiftedNative(function(self, next) {
      const act = self.deepReduce(this);
      const nact = next.deepReduce(this);
      return act.then(nact);
    }), "self", "next"))
  );
}

{
  const app = new UUID();
  set("App", app);
}

{
  const cnsl = new UUID();
  set("Console", cnsl);

  put(
    cnsl,
    "puts",
    func("val", new LiftedNative(function(val) {
      return new Act(() => {
        console.log(val.deepReduce(this).origin);
      });
    }))
  );
}

{
  const store = new UUID();
  std.set("Store", store);

  const findAndDecorateStore = (baseStore, targetStoreId, decorate) => {
    for (const i of baseStore.imports) {
      if (i.id.equals(targetStoreId)) {
        return decorate(i);
      }
    }

    return decorate(baseStore);
  };

  put(
    store,
    "set",
    func("id", "key", "val", exp(new LiftedNative(function(self, id, key, val) {
      return findAndDecorateStore(this, self, s => s.setAct(id, key, val));
    }), "self", "id", "key", "val"))
  );

  put(
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

  put(
    store,
    "generateAs",
    generateStoreFunc
  );

  put(
    store,
    "generateStoreAs",
    generateStoreFunc
  );
}

export function n(...args) {
  const origin = args.pop();
  const hsrc = args.pop();
  const head = hsrc ? v(hsrc) : v(null);
  if (Array.isArray(origin)) {
    return path("Array", ["new", head].concat(origin));
  } if (origin instanceof Object && !(origin instanceof Val)) {
    const maparr = Object.keys(origin).reduce((r, k) => {
      const o = origin[k];
      const val = o instanceof Val || typeof(o) === "string" ? o : v(o);
      return r.concat([k, val]);
    }, []);
    return path("Map", ["new", head].concat(maparr));
  } else {
    if (head instanceof Val && head.equals(v(null))) {
      const h = v(origin);
      return path("Comp", ["new", h]);
    } else {
      return path("Comp", ["new", head, origin]);
    }
  }
}
