import Sym from './sym';
import Val from './val';

class CaseAlt {
  constructor(...args) {
    this.pats = args.slice(0, -1);
    this.grds = args[args.length-1];
  }

  replaceWithPats(sym, val) {
    const pats = this.pats.filter(pat => !sym.equals(pat));
    const grds = Array.isArray(this.grds) ? this.grds.map(grd => grd.replace(sym, val)) : this.grds.replace(sym, val);
    const args = pats.concat([grds]);
    return new this.constructor(...args);
  }

  replace(sym, val) {
    if (this.pats.some(pat => sym.equals(pat))) {
      return this;
    }
    const grds = Array.isArray(this.grds) ? this.grds.map(grd => grd.replace(sym, val)) : this.grds.replace(sym, val);
    const args = this.pats.concat([grds]);
    return new this.constructor(...args);
  }
}
export function alt(...args) {
  return new CaseAlt(...args);
}

class CaseGrd {
  constructor(cond, exp) {
    this.cond = cond;
    this.exp = exp;
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
    return new Case(...alts);
  }

  replace(sym, val) {
    const alts = this.alts.map(alt => alt.replace(sym, val));
    return new Case(...alts);
  }

  apply(book, ...args) {
    for (const alt of this.alts) {
      const matches = args.map((v, i) => v.match(alt.pats[i]));
      if (matches.every(v => v !== undefined)) {
        let kase = new Case(alt);
        for (const match of matches) {
          for (const key of Object.keys(match)) {
            kase = kase.replaceWithPats(new Sym(key), match[key]);
          }
        }

        if (args.length < alt.pats.length) {
          return kase;
        }

        const grds = kase.alts[0].grds;
        if (Array.isArray(grds)) {
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
