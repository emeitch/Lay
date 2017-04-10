import State from "./state";

export default class Error extends State {
}

class TypeError extends Error {
}

class RequiredPropertyError extends Error {
}

export { TypeError, RequiredPropertyError }