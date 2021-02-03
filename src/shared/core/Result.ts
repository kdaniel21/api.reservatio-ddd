export class Failure<E, S = any> {
  constructor(private readonly error: E) {}

  get value(): E {
    return this.error
  }

  isFailure(): this is Failure<E, S> {
    return true
  }

  isSuccess(): this is Success<E, S> {
    return false
  }
}

export class Success<E, S> {
  constructor(readonly value?: S) {}

  isFailure(): this is Failure<E, S> {
    return false
  }

  isSuccess(): this is Success<E, S> {
    return true
  }
}

export namespace Result {
  export function fail<E, S = any>(error: E): Either<E, S> {
    return new Failure<E, S>(error)
  }

  export function ok<E, S>(value?: S): Either<E, S> {
    return new Success<E, S>(value)
  }

  export function combine<E, S>(results: Either<E, S>[]): Either<E, S> {
    const firstFailure = results.find(result => result.isFailure)

    return firstFailure || Result.ok()
  }
}

export type Either<E, S> = Failure<E, S> | Success<E, S>
