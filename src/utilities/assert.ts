type Falsy = null | undefined | false | 0 | "";

function assert<T>(assertion: Falsy | T, errorMessage: string): void {
  if (!assertion) {
    throw new Error(errorMessage);
  }
}

export { assert };
