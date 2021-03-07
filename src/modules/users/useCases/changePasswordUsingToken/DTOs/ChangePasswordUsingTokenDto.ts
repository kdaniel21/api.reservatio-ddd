export default interface ChangePasswordUsingTokenUseCase {
  passwordResetToken: string
  newPassword: string
}
