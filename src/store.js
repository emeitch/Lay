import UUID from './uuid';
import Log from './log';
import { sym } from './sym';
import { path } from './path';
import { ctx } from './ctx';
import v from './v';

function parseVal(raw) {
  const head = !raw || raw.head === undefined ? null : parseVal(raw.head);
  const type = typeof(raw);
  if (
    raw === null ||
    type === "number" ||
    type === "string" ||
    type === "boolean"
  ) {
    return raw;
  }

  if (Array.isArray(raw)) {
    return raw.map(i => parseVal(i));
  }

  if (type === "object") {
    if (!raw.type) {
      return sym(raw.origin);
    }

    const klass = parseVal(raw.type);
    if (klass.origin === "Comp") {
      return v(head, parseVal(raw.origin));
    } else if (klass.origin === "CompArray") {
      return v(head, raw.origin.map(i => parseVal(i)));
    } else if (klass.origin === "CompMap") {
      const org = {};
      for (const key of Object.keys(raw.origin)) {
        org[key] = parseVal(raw.origin[key]);
      }
      return v(head, org);
    } else if (klass.origin === "UUID") {
      return new UUID(raw.origin);
    } else if (klass.origin === "Path") {
      return path(...parseVal(raw.origin));
    } else if (klass.origin === "Ctx") {
      return ctx(...parseVal(raw.origin));
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
