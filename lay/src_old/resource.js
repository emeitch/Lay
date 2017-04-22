import { equals } from './utils';

import Value from './value';
import Error from './error';
import TypeError from './type_error';
import RequiredPropertyError from './required_property_error';

import Path from './path';

export default class Resource {
  constructor(store, path) {
    this.store = store;
    this.path = path;
  }
  
  get permanent() {
    // normalization
    return this.normalize();
  }
  
  get state() {
    return this.get();
  }
    
  get proto() {
    return this.store.getProtoResource(this.state);
  }
  
  get parent() {
    const parentPath = this.state._parent;
    if (parentPath) {
      return this.store.follow(parentPath);
    }
    return undefined;
  }
  
  get isAbstract() {
    return this.state._abstract;
  }
  
  get name() {
    return this.state._name;
  }
  
  normalize() {
    let res = this.store;
    for (const key of this.path.keys) {
      res = res.follow(key);
    }
    return res;
  }
  
  equals(other) {
    if (other instanceof Resource) {
      return equals(this.permanent.path, other.permanent.path);
    } else {
      // state equivalency
      return equals(this.state, other);
    }
  }
  
  validate(state) {
    for (var key in state) {
      if (state.hasOwnProperty(key)) {
        const val = state[key];
        const prop = this.follow(key);
        const propState = (prop && prop.get()) || prop;
        if (propState 
          && !equals(propState, val.__proto__) 
          && !equals(propState.__proto__, val.__proto__)) {
          return new Value({
            _proto: new Path(TypeError.name),
          });
        }
      }
    }
    
    const current = this.get();
    for (var key in current) {
      if (current.hasOwnProperty(key)) {
        if (this.follow(key).isAbstract && state[key] === undefined) {
          return new Value({
            _proto: new Path(RequiredPropertyError.name),
          });
        }
      }
    }
    
    return null;
  }
    
  follow(key) {
    const state = this.get();
    const val = state[key];
    if (val instanceof Path) { // reference entity
      return this.store.follow(val);
    } else if (val === undefined && this.proto !== undefined) { // prototype chain
      return this.proto.follow(key);
    } else {
      return this.store.follow(this.path.child(key));
    }
  }
  
  get() {
    return this.store.getState(this.path);
  }
  
  put(state) {
    const parentPath = this.path.parent();
    if (parentPath) {
      this.store.follow(parentPath).patch({[this.path.last]: state});
    } else {
      this.store.setState(this.path.top, state);
    }    
  }

  patch(diff) {
    const current = this.get();
    const state = Object.assign({}, current, diff);
    this.put(state);
  }
  
  // todo: postを追加する(resourceがprotoになる?)
}
