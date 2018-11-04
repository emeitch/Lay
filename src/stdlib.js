import Val from './val';
import v from './v';
import UUID from './uuid';
import Act from './act';
import Book from './book';
import Prim from './prim';
import Comp, { CompArray, CompMap } from  './comp';
import { exp } from './exp';
import { kase, alt, grd, otherwise } from './case';
import { func, LiftedNative } from './func';
import { path } from './path';
import { parse } from './store';

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

  stdlib.set("load", func(new LiftedNative(function() {
    const book = this;
    return new Act(edgesStr => {
      const jsobj = edgesStr ? JSON.parse(edgesStr) : [];
      const edges = parse(jsobj);
      for (const edge of edges) {
        book.appendEdge(edge.tail, edge.label, edge.head, edge.rev);
      }
    });
  })));

  stdlib.set("filterEdges", func("pattern", new LiftedNative(function(pattern) {
    const book = this;
    const p = pattern.deepReduce(book).origin;
    return new Act(edges => {
      const filtered = [];
      for (const edge of edges) {
        const id = book.getEdgeHead(edge.tail, "subject");
        const key = book.getEdgeHead(edge.tail, "type");
        const idtype = path(id, "type").deepReduce(book);
        const typename = book.name(idtype);

        if (filtered.find(e => e.rev.equals(id))) {
          filtered.push(edge);
          continue;
        }

        for (const type of Object.keys(p)) {
          const keys = p[type];
          if ((idtype.origin === type || typename.origin === type) && keys.includes(key.origin)) {
            filtered.push(edge);
            break;
          }
        }
      }
      return filtered;
    });
  })));
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
        return this.new(p);
      });
    }))
  );

  stdlib.put(
    obj,
    "add",
    func("key", "val", exp(new LiftedNative(function(self, key, val) {
      return this.putAct(self, key.reduce(this), val.reduce(this));
    }), "self", "key", "val"))
  );

  stdlib.put(
    obj,
    "def",
    func("key", "val", exp(new LiftedNative(function(self, key, val) {
      return this.setAct(self, key.reduce(this), val);
    }), "self", "key", "val"))
  );

  stdlib.put(
    obj,
    "set",
    func("key", "val", exp(new LiftedNative(function(self, key, val) {
      return this.setAct(self, key.reduce(this), val.reduce(this));
    }), "self", "key", "val"))
  );

  stdlib.put(
    obj,
    "get",
    func("key", exp(new LiftedNative(function(self, key) {
      const rels = this.activeRels(self, key.reduce(this));
      return this.getEdgeHead(rels[0], "object");
    }), "self", "key"))
  );

  stdlib.put(
    obj,
    "getAtIndex",
    func("key", "index", exp(new LiftedNative(function(self, key, index) {
      const rels = this.activeRels(self, key.reduce(this));
      const i = index.reduce(this).origin;
      return this.getEdgeHead(rels[i], "object");
    }), "self", "key", "index"))
  );

  stdlib.put(
    obj,
    "allOf",
    func("key", exp(new LiftedNative(function(self, key) {
      const rels = this.activeRels(self, key.reduce(this));
      return v(rels.map(r => this.getEdgeHead(r, "object")));
    }), "self", "key"))
  );

  // todo: allはClassオブジェクト用のメソッドにしたい
  stdlib.put(
    obj,
    "all",
    exp(new LiftedNative(function(self) {
      return v(this.instanceIDs(self));
    }), "self")
  );
}

{
  const str = new UUID();
  stdlib.set("String", str);

  stdlib.put(
    str,
    "trim",
    exp(new LiftedNative(function(self) {
      return v(self.origin.trim());
    }), "self")
  );
}

{
  const bool = new UUID();
  stdlib.set("Boolean", bool);

  stdlib.put(
    bool,
    "not",
    exp(new LiftedNative(function(self) {
      return v(!self.origin);
    }), "self")
  );
}

{
  const comp = new UUID();
  stdlib.set("Comp", comp);

  stdlib.put(
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
  const arr = new UUID();
  stdlib.set("Array", arr);

  stdlib.put(
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

  stdlib.put(
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

  stdlib.put(
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
    "count",
    exp(new LiftedNative(function(self) {
      return v(self.origin.length);
    }), "self")
  );

  stdlib.put(
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
  const map = new UUID();
  stdlib.set("Map", map);

  stdlib.put(
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

  stdlib.put(
    map,
    "get",
    func("key", exp(new LiftedNative(function(self, key) {
      return self.get(key, this);
    }), "self", "key"))
  );
}

{
  const date = new UUID();
  stdlib.set("Date", date);
}

{
  const act = new UUID();
  stdlib.set("Act", act);

  stdlib.put(
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
  stdlib.set("App", app);
}

{
  const cnsl = new UUID();
  stdlib.set("Console", cnsl);

  stdlib.put(
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
  const book = new UUID();
  stdlib.set("Book", book);

  const findAndDecorateBook = (baseBook, targetBookId, decorate) => {
    for (const i of baseBook.imports) {
      if (i.id.equals(targetBookId)) {
        return decorate(i);
      }
    }

    return decorate(baseBook);
  };

  stdlib.put(
    book,
    "put",
    func("id", "key", "val", exp(new LiftedNative(function(self, id, key, val) {
      return findAndDecorateBook(this, self, b => b.putAct(id, key, val));
    }), "self", "id", "key", "val"))
  );

  stdlib.put(
    book,
    "importedBooks",
    exp(new LiftedNative(function(self) {
      return findAndDecorateBook(this, self, b => v(b.imports.map(i => i.id)));
    }), "self")
  );

  // todo: 本来は片方を参照して共通化したいが、うまく行かないのでJSレベルの値で共通化
  const generateFunc = func("name", exp(new LiftedNative(function(self, name) {
    const b = new Book();
    const n = name.reduce(this).origin;
    return new Act(() => {
      return this.import(b, n);
    });
  }), "self", "name"));

  stdlib.put(
    book,
    "generateAs",
    generateFunc
  );

  stdlib.put(
    book,
    "generateBookAs",
    generateFunc
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
