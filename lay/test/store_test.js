import assert from 'assert';
import UUID from '../src/uuid';
import Store from '../src/store';

describe('Store', () => {
  const subj = new UUID();
  const rel = new UUID();
  const obj = new UUID();
  
  let store;
  before(() => {
    store = new Store();
  })
    
  describe('#add', () => {
    it('should add a proposition', () => {
      const p = store.add(subj, rel, obj);

      console.assert(p.subject == subj);
      console.assert(p.relation == rel);
      console.assert(p.object == obj);
      console.assert(p.holder == undefined);
      assert(p.id.match(/^urn:sha256:.*$/));
      console.assert(store.get(p.id) == p);
    });
    
    describe('with holder', () => {
      it('shold add a proposition with place', () => {
        const holder = new UUID();
        const p = store.add(subj, rel, obj, holder);
        
        console.assert(p.subject == subj);
        console.assert(p.relation == rel);
        console.assert(p.object == obj);
        console.assert(p.holder == holder);
        console.assert(store.get(p.id) == p);
      });
    });
  });
});
