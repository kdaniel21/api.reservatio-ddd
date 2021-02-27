interface KoaErrorProps {
  message?: string
  code?: string
  statusCode?: number
}

export default abstract class KoaError implements KoaErrorProps {
  message: string
  code: string
  statusCode: number = 400

  constructor(props?: KoaErrorProps) {
    this.message = props.message
    this.code = props.code
    this.statusCode = props.statusCode
  }
}
