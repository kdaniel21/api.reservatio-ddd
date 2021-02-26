import Koa from 'koa'
import BaseController from '@shared/infra/http/models/BaseController'
import GetCurrentUserControllerDto from './DTOs/GetCurrentUserControllerDto'

export default class GetCurrentUserController extends BaseController<GetCurrentUserControllerDto> {
  constructor() {
    super()
  }

  async executeImpl(ctx: Koa.Context): Promise<void> {}
}
