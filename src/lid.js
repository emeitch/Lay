import UUID from './uuid';

export default class LID extends UUID {
  prefix() {
    return "lid:urn:uuid:";
  }
}
