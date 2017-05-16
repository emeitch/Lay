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

      assert(p.subject == subj);
      assert(p.relation == rel);
      assert(p.object == obj);
      assert(p.holder == undefined);
      assert(p.id.match(/^urn:sha256:.*$/));
      assert(store.get(p.id) == p);
    });
    
    describe('with holder', () => {
      it('shold add a proposition with holder', () => {
        const holder = new UUID();
        const p = store.add(subj, rel, obj, holder);
        
        assert(p.subject == subj);
        assert(p.relation == rel);
        assert(p.object == obj);
        assert(p.holder == holder);
        assert(store.get(p.id) == p);
      });
    });
  });
});
