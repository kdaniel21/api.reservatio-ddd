import { ErrorOr } from './DomainError'

export default interface UseCase<Request, Response> {
  execute(request: Request, response: Response): Promise<ErrorOr<Response>> | ErrorOr<Response>
}
