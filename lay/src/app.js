import UUID from './uuid';
import Link from './link';
import Store from './store';

{
  console.assert(new UUID().urn.match(/^urn:uuid:.*$/));
}

{
  const store = new Store();
  const type = new UUID();
  const from = new UUID();
  const to = new UUID();
  const link = new Link(type, from, to);

  console.assert(link.type == type);
  console.assert(link.from == from);
  console.assert(link.to == to);
  
  store.append(link);
  console.assert(store.get(link.id) == link);
}

{
  const store = new Store();
  const type = new UUID();
  const from = new UUID();
  const to = new UUID();
  const link = store.add(type, from, to);

  console.assert(link.type == type);
  console.assert(link.from == from);
  console.assert(link.to == to);
  console.assert(store.get(link.id) == link);
}

console.log("all tests succeeded.");