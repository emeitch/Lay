import assert from 'assert';
import UUID from '../src/uuid';
import Link from '../src/link';
import Store from '../src/store';

describe('Store', () => {
  const type = new UUID();
  const from = new UUID();
  const to = new UUID();
  
  let store;
  before(() => {
    store = new Store();
  })
  
  describe('#append', () => {
    it('should append a link', () => {
      const link = new Link(type, from, to);
      store.append(link);
      
      console.assert(store.get(link.id) == link);
    });
  });
  
  describe('#add', () => {
    it('should add a link', () => {
      const link = store.add(type, from, to);

      console.assert(link.type == type);
      console.assert(link.from == from);
      console.assert(link.to == to);
      console.assert(link.in == undefined);
      console.assert(store.get(link.id) == link);
    });
  });
});
