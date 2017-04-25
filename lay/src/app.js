import UUID from './uuid';
import Link from './link'

console.assert(UUID.generate().str.match(/^urn:uuid:.*$/));

const type = UUID.generate();
const from = UUID.generate();
const to = UUID.generate();
const ln = new Link(type, from, to);
console.assert(ln.type == type);
console.assert(ln.from == from);
console.assert(ln.to == to);

console.log("all tests succeeded.");