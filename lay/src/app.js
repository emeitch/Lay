import UUID from './uuid';
import Link from './link'

console.assert(UUID.path().match(/^\/uuid\/.*$/));

const type = UUID.path()
const from = UUID.path();
const to = UUID.path();
const ln = new Link(type, from, to);
console.assert(ln.type == type);
console.assert(ln.from == from);
console.assert(ln.to == to);

console.log("all tests succeeded.");