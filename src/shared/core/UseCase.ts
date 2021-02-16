export default interface UseCase<Request, Response> {
  execute(request: Request, response: Response): Promise<Response> | Response
}
