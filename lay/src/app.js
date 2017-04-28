import UUID from './uuid';
import Link from './link'

console.assert(UUID.path().match(/^\/uuid\/.*$/));

const type = "/membership";
const from = UUID.path();
const to = UUID.path();
const link = new Link(type, from, to);
console.assert(link.type == type);
console.assert(link.from == from);
console.assert(link.to == to);

console.log("all tests succeeded.");