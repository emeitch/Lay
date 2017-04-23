import UUID from './uuid'

console.assert(UUID.generate().str.match(/^urn:uuid:.*$/));

console.log("all tests succeeded.");