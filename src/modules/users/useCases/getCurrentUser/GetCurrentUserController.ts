import BaseController from '@shared/infra/http/BaseController'
import GetCurrentUserControllerDto from './DTOs/GetCurrentUserControllerDto'
import KoaContext from '@shared/infra/http/koa/KoaContext'

export default class GetCurrentUserController extends BaseController<GetCurrentUserControllerDto> {
  constructor() {
    super()
  }

  async executeImpl(ctx: KoaContext): Promise<void> {}
}
