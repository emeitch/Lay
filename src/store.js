import Prim from './prim';
import Sym from './sym';
import UUID from './uuid';
import Log from './log';

function parseVal(raw) {
  const type = typeof(raw);
  if (type === "string") {
    return new Sym(raw);
  } else if (type === "object") {
    if (raw.class === "Number" ||
        raw.class === "String" ||
        raw.class === "Boolean" ||
        raw.class === "Null" ||
        raw.class === "CompArray" ||
        raw.class === "CompMap") {
      return new Prim(raw.origin);
    } else if (raw.class === "UUID") {
      return new UUID(raw.origin);
    }
  }

  throw `can not identify a val: ${raw}`;
}

export function parse(raws) {
  const logs = [];
  for (const raw of raws) {
    const id = parseVal(raw.id);
    const key = parseVal(raw.key);
    const val = parseVal(raw.val);
    const at = new Date(raw.at);
    const logid = parseVal(raw.logid);
    const log = new Log(id, key, val, at, raw.in, logid);
    logs.push(log);
  }
  return logs;
}
