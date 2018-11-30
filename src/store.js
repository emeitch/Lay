import UUID from './uuid';
import Edge from './edge';
import { sym } from './sym';
import { path } from './path';
import v from './v';

export default class Store {
  constructor() {
    this.objs = new Map();
  }

  set(key, val) {
    this.objs.set(key, v(val));
  }

  get(key) {
    return this.objs.get(key);
  }

  getProp(id, key) {
    const obj = this.get(id);
    return obj && obj.get(key, this);
  }
}

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
    } else if (klass.origin === "Date") {
      return v(head, new Date(raw.origin));
    } else if (klass.origin === "UUID") {
      return new UUID(raw.origin);
    } else if (klass.origin === "Path") {
      return path(...parseVal(raw.origin));
    } else {
      throw `unsupported type: ${JSON.stringify(raw)}`;
    }
  }

  throw `can not identify a val: ${JSON.stringify(raw)}`;
}

export function parse(raws) {
  const edges = [];
  for (const raw of raws) {
    const tail = parseVal(raw.tail);
    const label = raw.label;
    const head = parseVal(raw.head);
    const rev = parseVal(raw.rev);
    const edge = new Edge(v(tail), label, v(head), rev);
    edges.push(edge);
  }
  return edges;
}
