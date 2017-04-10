function flatten(array) {
  return Array.prototype.concat.apply([], array);
}

function equals(o1, o2) {
  return JSON.stringify(o1) === JSON.stringify(o2);
}

export { flatten, equals };