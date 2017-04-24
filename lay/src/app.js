import UUID from './uuid';
import Property from './property'

console.assert(UUID.generate().str.match(/^urn:uuid:.*$/));

const sbj = UUID.generate();
const prd = UUID.generate();
const obj = UUID.generate();
const prop = new Property(sbj, prd, obj);
console.assert(prop.subject == sbj);
console.assert(prop.predicate == prd);
console.assert(prop.object == obj);

console.log("all tests succeeded.");