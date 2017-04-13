import BiMap from 'bidirectional-map';

import Value from './value';
import Entity from './entity';
import Error, { TypeError, RequiredPropertyError } from './error';

import Path from './path';
import Resource from './resource';

export default class Store {
  constructor() {
    this.bindings = new BiMap();
    
    // premitives
    this.appendState(Object.assign(new Boolean(false), {
      _name: Boolean.name, 
      _abstract: true
    }));
    this.appendState(Object.assign(new Number(0), {
      _name: Number.name,
      _abstract: true
    }));
    this.appendState(Object.assign(new String(""), {
      _name: String.name,
      _abstract: true
    }));
    this.appendState(Object.assign(new Array(), {
      _name: Array.name,
      _abstract: true
    }));
    this.appendState(new Value({
      _name: Value.name,
      _abstract: true
    }));
    this.appendState(new Entity({
      _name: Entity.name,
      _abstract: true
    }));
    
    this.appendState(new Error({_name: Error.name}));
    this.appendState(new TypeError({_name: TypeError.name}));
    this.appendState(new RequiredPropertyError({_name: RequiredPropertyError.name}));
  }
  
  getProtoResource(state) {
    const protoPath = state._proto;
    if (protoPath) {
      return this.follow(protoPath);
    }

    return undefined;
  }
  
  resolveName(key) {
    if (!Path.isName(key)) {
      return key;
    }
    
    const uuid = this.bindings.get(key);
    if (!uuid) {
      return undefined;
    }
    
    return uuid;
  }
    
  resolvePathTopName(path) {
    const top = this.resolveName(path.top);
    if (!top) {
      return undefined;
    }
    
    return new Path(top, ...path.rest);
  }
  
  getState(id) {
    if (typeof(id) === "string") {
      const key = this.resolveName(id);
      return this[key];
    }
    
    const path = this.resolvePathTopName(id);
    let state = this.getState(path.top);
    for (const key of path.rest) {
      const val = state[key];
      if (!val) {
        return undefined;
      } else if (val instanceof Path) {
        state = this.getState(val);
      } else {
        state = val;
      }
    }
    return state;
  }
  
  entities(state) {
    const entities = {};
    
    let proto = this.getProtoResource(state);
    while (proto) {
      const state = proto.get();
      for (var key in state) {
        // reject const key for namespase
        if (state.hasOwnProperty(key) && !Path.isConst(key)) { 
          const val = proto.follow(key).get();
          if (val instanceof Entity && !entities[key]) {
            entities[key] = val;
          }
        }
      }
      
      proto = proto.proto;
    }
    
    return entities;
  }
    
  setState(key, state) {
    if (state === null) {
      delete this[key];
      return undefined;
    }
    
    const res = this.follow(key);
    
    const proto = this.getProtoResource(state);
    const error = proto ? proto.validate(state) : undefined;
    if (error) {
      this[key] = error;
      return this.follow(key);
    }
    
    const name = state._name;
    if (name) {
      this.bindings.set(name, key);
    }
    
    const appendChild = (child) => {
      const childId = child._uuid || Path.uuid();
      
      delete child._uuid;
      child._parent = new Path(key);
      
      this.setState(childId, child);
      return childId;
    };
    
    for (const k in state) {
      if (state.hasOwnProperty(k)) {
        const v = state[k];
        if (v instanceof Path) {
          // resolve name and recurcive definition
          state[k] = this.resolvePathTopName(v);
        } else if (v instanceof Entity) {
          // set entity as child resource
          const entity = v;
          const childId = appendChild(entity);
          state[k] = new Path(childId);
        } else if (v === null) {
          // remove null property
          delete state[k];
        }
      }
    }
     
    const entities = this.entities(state);
    for (const k in entities) {
      if (entities.hasOwnProperty(k)) {
        // remove old child parent
        if (res) {
          const old = res.follow(k);
          if (old) {
            old.patch({_parent: null});
          }
        }
        
        const entity = entities[k];
        const override = state[k];
        const child = override ? Object.assign({}, entity, override) : entity;
        const childId = appendChild(child);
        state[k] = new Path(childId);
      }
    }
    
    this[key] = state;
    return this.follow(key);
  }
  
  appendState(state) {
    const key = Path.uuid();
    return this.setState(key, state);
  }
    
  // same interface for Resource
  follow(id) {
    const path = this.resolvePathTopName(
      typeof(id) === "string" ? new Path(id) : id
    );
    
    if (!path || !this.getState(path)) {
      return undefined;
    }
    
    return new Resource(this, path);
  }
    
  post(state) {
    return this.appendState(state);
  }
}
