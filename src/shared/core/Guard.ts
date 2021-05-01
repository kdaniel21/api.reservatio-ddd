export interface GuardResult {
  isSuccess: boolean
  message?: string
}

export interface GuardArguments {
  argument: any
  argumentName: string
}

type PossibleTypes = 'string' | 'number' | 'bigint' | 'boolean' | 'symbol' | 'undefined' | 'object' | 'function'

export class Guard {
  static combine(results: GuardResult[]): GuardResult {
    const successResult = { isSuccess: true }

    return results.find(result => !result.isSuccess) || successResult
  }

  static againstShorterThan(length: number, props: GuardArguments): GuardResult {
    const { argument: text, argumentName } = props

    return text.length < length
      ? {
          isSuccess: false,
          message: `${argumentName} must be longer than ${length} characters.`,
        }
      : { isSuccess: true }
  }

  static againstLongerThan(length: number, props: GuardArguments): GuardResult {
    const { argument: text, argumentName } = props

    return text.length > length
      ? {
          isSuccess: false,
          message: `${argumentName} must be at most ${length} characters.`,
        }
      : { isSuccess: true }
  }

  static againstNullOrUndefined(props: GuardArguments): GuardResult {
    const { argument, argumentName } = props

    return [null, undefined, ''].includes(argument)
      ? { isSuccess: false, message: `${argumentName} is null or undefined` }
      : { isSuccess: true }
  }

  static againstNullOrUndefinedBulk(props: GuardArguments[]): GuardResult {
    const successResult = { isSuccess: true }
    const results = props.map(prop => this.againstNullOrUndefined(prop))

    return results.find(result => !result.isSuccess) || successResult
  }

  static isTypeof(type: PossibleTypes, props: GuardArguments): GuardResult {
    const { argumentName, argument } = props

    return typeof argument === type
      ? { isSuccess: true }
      : { isSuccess: false, message: `Property ${argumentName} must be of type ${type}` }
  }

  static isDate(props: GuardArguments): GuardResult {
    const { argument, argumentName } = props
    return argument instanceof Date
      ? { isSuccess: true }
      : { isSuccess: false, message: `Property ${argumentName} most be a valid Date!` }
  }
}
