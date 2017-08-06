import Exp from './exp';
import Box from './box';
import Env from './env';

class CaseAlt {
  constructor(pat, exp) {
    this.pat = pat;
    this.exp = exp;
  }
}
export function alt(pat, exp) {
  return new CaseAlt(pat, exp);
}

export default class Case extends Exp {
  constructor(exp, ...alts) {
    super();
    this.exp = exp;
    this.alts = alts;
  }

  reduce(env=new Box()) {
    const val = this.exp.reduce(env);
    for (const alt of this.alts) {
      const bindings = val.match(alt.pat);
      if (bindings) {
        const e = new Env(env, undefined, bindings);
        return alt.exp.reduce(e);
      }
    }

    throw "matched pattern not found";
  }
}
