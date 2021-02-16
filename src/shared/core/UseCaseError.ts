interface UseCaseErrorProps {
  message: string
  code?: string
}

export default abstract class UseCaseError implements UseCaseErrorProps {
  constructor(public message: string, public code?: string) {}
}
