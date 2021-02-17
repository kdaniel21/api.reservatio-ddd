export class Failure<E, S = any> {
  constructor(public readonly error: E) {}

  get value(): S {
    throw new Error('Cannot retrieve value from failed result.')
  }

  isFailure(): this is Failure<E, S> {
    return false
  }

  isSuccess(): this is Success<E, S> {
    return false
  }
}

export class Success<E, S> {
  constructor(public readonly payload?: S) {}

  get value(): S {
    if (!this.payload) throw new Error('This result does not have a value')

    return this.payload
  }

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

  export function combine<E>(results: Either<E, any>[]): Either<E, any> {
    const firstFailure = results.find(result => result.isFailure)

    return firstFailure || Result.ok()
  }
}

// export type Either<E, S> = Failure<E, S> | Success<E, S>
export type Either<E, S> = Failure<E, S> | Success<E, S>
