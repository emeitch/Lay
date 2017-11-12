import Val, { v } from './val';
import { sym } from './sym';
import { exp } from './exp';

export class Native extends Val {
  apply(book, ...bargs) {
    const args = bargs.concat();
    const rest = this.origin.length - args.length;
    if (rest > 0) {
      let pats = [];
      for (let i = 0; i < rest; i++) {
        // todo: もっと適切なシンボルにしたい
        const vname = "__" + "arg_" + i + "__";
        pats.push(vname);
      }
      const e = exp(this, ...args.concat(pats));
      return Func.func(...pats.concat([e]));
    }

    for (let i = 0; i < args.length; i++) {
      const a = args[i];
      const na = a.step(book);

      if (!na.equals(a)) {
        args[i] = na;
        return exp(this, ...args);
      }
    }

    if (args.some(arg => arg.constructor !== Val)) {
      return exp(this, ...args);
    }

    const oargs = args.map(a => a.origin);
    const orig = this.origin.apply(undefined, oargs);
    return v(orig);
  }
}

class CaseAlt {
  constructor(...args) {
    const pats = args.slice(0, -1);
    this.pats = pats.map(p => typeof(p) === "string" ? sym(p) : p);
    this.grds = this.parseGuards(args[args.length-1]);
  }

  parseGuards(grds) {
    if (grds instanceof Function) {
      if (grds.length > 0 && grds.length != this.pats.length) {
        throw "arity mismatched for native function";
      }
      grds = new Native(grds);
    }

    if (!Array.isArray(grds)) {
      grds = [grd(new Val(true), grds)];
    }

    return grds;
  }

  _replace(book, matches, pats) {
    const grds = this.grds.map(grd => {
      return grd.replace(book, matches);
    });

    return new this.constructor(...pats.concat([grds]));
  }

  replaceWithPats(book, matches) {
    const pats = [];
    for (const match of matches) {
      for (const key of Object.keys(match)) {
        for (const pat of this.pats) {
          if (key !== "it" && !sym(key).equals(pat)) {
            pats.push(pat);
          }
        }
      }
    }

    return this._replace(book, matches, pats);
  }

  replace(book, matches) {
    for (const match of matches) {
      for (const key of Object.keys(match)) {
        if (this.pats.some(pat => sym(key).equals(pat))) {
          return this;
        }
      }
    }
    return this._replace(book, matches, this.pats);
  }
}
export function alt(...args) {
  return new CaseAlt(...args);
}

class CaseGrd {
  constructor(cond, exp) {
    this.cond = cond;
    if (typeof(exp) === "string") {
      this.exp = sym(exp);
    } else {
      this.exp = exp;
    }
  }

  replace(book, matches) {
    const exp = this.exp.replace(book, matches);

    return new this.constructor(
      this.cond.replace(book, matches),
      exp
    );
  }
}
export function grd(cond, exp) {
  return new CaseGrd(cond, exp);
}

export const otherwise = new Val(true);

export default class Case extends Val {
  static func(...args) {
    return new this(alt(...args));
  }

  constructor(...alts) {
    super();
    this.alts = alts;
  }

  replace(book, matches) {
    const alts = this.alts.map(alt => alt.replace(book, matches));
    return new this.constructor(...alts);
  }

  apply(book, ...args) {
    for (const alt of this.alts) {
      const matches = args.map((arg, i) => arg.match(alt.pats[i]));
      if (matches.every(match => match !== undefined)) {
        const kalt = alt.replaceWithPats(book, matches);
        const kase = new this.constructor(kalt);

        if (args.length < alt.pats.length) {
          const e = kase.alts[0].grds[0].exp;
          if (e instanceof Native) {
            return exp(e, ...args);
          }

          return kase;
        }

        for (const grd of kase.alts[0].grds) {
          if (grd.cond.reduce(book).origin) {
            if (grd.exp instanceof Native) {
              return exp(grd.exp, ...args);
            }
            return grd.exp;
          }
        }
      }
    }

    throw "matched pattern not found";
  }
}

export function kase(...args) {
  return new Case(...args);
}

export class Func extends Case {
  get exp() {
    return this.alts[0].grds[0].exp;
  }
}
