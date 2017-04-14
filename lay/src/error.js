import State from "./state";

export default class Error extends State {
}

export class TypeError extends Error {
}

export class RequiredPropertyError extends Error {
}
