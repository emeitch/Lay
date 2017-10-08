import { sym } from './sym';
import Val from './val';

class CaseAlt {
  constructor(...args) {
    const pats = args.slice(0, -1);
    this.pats = pats.map(p => typeof(p) == "string" ? sym(p) : p);
    this.grds = args[args.length-1];
  }

  _replace(sym, val, pats) {
    let grds;
    if (this.grds instanceof Function) {
      return this;
    } else if (Array.isArray(this.grds)) {
      grds = this.grds.map(grd => grd.replace(sym, val));
    } else {
      grds = this.grds.replace(sym, val);
    }
    const args = pats.concat([grds]);
    return new this.constructor(...args);
  }

  replaceWithPats(sym, val) {
    const pats = this.pats.filter(pat => !sym.equals(pat));
    return this._replace(sym, val, pats);
  }

  replace(sym, val) {
    if (this.pats.some(pat => sym.equals(pat))) {
      return this;
    }
    return this._replace(sym, val, this.pats);
  }
}
export function alt(...args) {
  return new CaseAlt(...args);
}

class CaseGrd {
  constructor(cond, exp) {
    this.cond = cond;
    this.exp = typeof(exp) == "string" ? sym(exp) : exp;
  }

  replace(sym, val) {
    return new this.constructor(
      this.cond.replace(sym, val),
      this.exp.replace(sym, val)
    );
  }
}
export function grd(cond, exp) {
  return new CaseGrd(cond, exp);
}

class CaseGrdOtherwise extends Val {
  reduce(_) {
    return new Val(true);
  }
}
export const otherwise = new CaseGrdOtherwise();

export default class Case extends Val {
  constructor(...alts) {
    super();
    this.alts = alts;
  }

  replaceWithPats(sym, val) {
    const alts = this.alts.map(alt => alt.replaceWithPats(sym, val));
    return new this.constructor(...alts);
  }

  replace(sym, val) {
    const alts = this.alts.map(alt => alt.replace(sym, val));
    return new this.constructor(...alts);
  }

  apply(book, ...args) {
    for (const alt of this.alts) {
      const matches = args.map((v, i) => v.match(alt.pats[i]));
      if (matches.every(v => v !== undefined)) {
        let kase = new this.constructor(alt);
        for (const match of matches) {
          for (const key of Object.keys(match)) {
            kase = kase.replaceWithPats(sym(key), match[key]);
          }
        }

        if (args.length < alt.pats.length) {
          return kase;
        }

        const grds = kase.alts[0].grds;
        if (grds instanceof Function) {
          const f = grds;
          const oargs = args.map(a => a.origin);
          const orig = f.apply(undefined, oargs);
          return new Val(orig);
        } else if (Array.isArray(grds)) {
          for (const grd of grds) {
            if (grd.cond.reduce(book).origin) {
              return grd.exp.reduce(book);
            }
          }
        } else {
          const exp = grds;
          return exp.reduce(book);
        }
      }
    }

    throw "matched pattern not found";
  }
}

export function kase(...args) {
    return new Case(...args);
}
