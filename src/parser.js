import UUID from './uuid';
import { sym } from './sym';
import { path } from './path';
import v from './v';

export function parseVal(raw) {
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
    if (!raw._type) {
      return sym(raw.origin);
    }

    const klass = parseVal(raw._type);
    if (klass.origin === "Comp") {
      return v(head, parseVal(raw.origin));
    } else if (klass.origin === "Array") {
      return v(head, raw.origin.map(i => parseVal(i)));
    } else if (klass.origin === "Date") {
      return v(head, new Date(raw.origin));
    } else if (klass.origin === "UUID") {
      return new UUID(raw.origin);
    } else if (klass.origin === "Path") {
      return path(...parseVal(raw.origin));
    } else {
      const org = {};
      let _head;
      for (const key of Object.keys(raw)) {
        if (key == "_type" && klass.origin === "Map") {
          continue;
        }

        if (key == "_head") {
          _head = parseVal(raw[key]);
          continue;
        }

        org[key] = parseVal(raw[key]);
      }
      return v(_head, org);
    }
  }

  throw `can not identify a val: ${JSON.stringify(raw)}`;
}

export function parseObjs(raws) {
  const objs = [];
  for (const raw of raws) {
    const obj = parseVal(raw);
    objs.push(obj);
  }
  return objs;
}
