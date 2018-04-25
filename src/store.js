import Sym from './sym';
import UUID from './uuid';
import Log from './log';
import v from './v';

function parseVal(raw) {
  const head = !raw || raw.head === undefined ? null : parseVal(raw.head);
  const type = typeof(raw);
  if (type === "string") {
    return new Sym(raw);
  } else if (type === "object") {
    if (raw.class === "Number" ||
        raw.class === "String" ||
        raw.class === "Boolean" ||
        raw.class === "Null") {
      return v(raw.origin);
    } else if (raw.class === "Comp") {
      return v(head, raw.origin);
    } else if (raw.class === "Array") {
      return v(head, raw.origin.map(i => parseVal(i)));
    } else if (raw.class === "Map") {
      const org = {};
      for (const key of Object.keys(raw.origin)) {
        org[key] = parseVal(raw.origin[key]);
      }
      return v(head, org);
    } else if (raw.class === "UUID") {
      return new UUID(raw.origin);
    } else {
      return raw;
    }
  } else if (
    type === "number" ||
    type === "boolean" ||
    type === "null"
  ) {
    return raw;
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
