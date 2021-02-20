import Koa from 'koa'
import BaseController from '@shared/infra/http/models/BaseController'
import LoginUseCase from './LoginUseCase'

export default class LoginController extends BaseController {
  constructor(private useCase: LoginUseCase) {
    super()
  }

  async executeImpl(ctx: Koa.Context): Promise<void> {}
}
