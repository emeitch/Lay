import UUID from './uuid';
import Link from './link'

console.assert(new UUID().urn.match(/^urn:uuid:.*$/));

const type = new UUID();
const from = new UUID();
const to = new UUID();
const link = new Link(type, from, to);
console.assert(link.type == type);
console.assert(link.from == from);
console.assert(link.to == to);

console.log("all tests succeeded.");