export default interface ChangePasswordUsingTokenUseCaseDto {
  passwordResetToken: string
  newPassword: string
}
