export class Failure<E, S> {
  constructor(public readonly error?: E) {}

  get value(): S {
    throw new Error('Cannot retrieve value from failed result.')
  }

  isFailure(): this is Failure<E, S> {
    return true
  }

  isSuccess(): this is Success<E, S> {
    return false
  }
}

export class Success<E, S> {
  constructor(public readonly value?: S) {}

  get error(): E {
    throw new Error('Cannot retrieve error from successful result.')
  }

  isFailure(): this is Failure<E, S> {
    return false
  }

  isSuccess(): this is Success<E, S> {
    return true
  }
}

export namespace Result {
  export function fail<E extends object, S = any>(ErrorClass?: (new () => E) | E): Either<E, S> {
    if (!ErrorClass) return new Failure<E, S>()

    const errorInstance: E = typeof ErrorClass === 'object' ? ErrorClass : new ErrorClass()
    return new Failure<E, S>(errorInstance)
  }

  export function ok<E, S>(value?: S): Either<E, S> {
    return new Success<E, S>(value)
  }

  export function combine<E>(results: Either<E, any>[]): Either<E, any> {
    const firstFailure = results.find(result => result.isFailure())

    return firstFailure || Result.ok()
  }
}

export type Either<E, S> = Failure<E, S> | Success<E, S>
