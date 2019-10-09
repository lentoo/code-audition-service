import {
  Resolver,
  Mutation,
  Ctx,
  Arg,
  Authorized,
  Query,
  UseMiddleware
} from 'type-graphql'
import { Context } from 'egg'
import { ActionResponseModel } from '../../../model/BaseModel'
import { PaginationAttentionUserResponse } from '../../../model/attention-user/AttentionUser'
import { PaginationProp } from '../../../model/Pagination'
import { FieldsMiddleware } from '../../middleware'
@Resolver()
export class AttentionUserResolver {
  @Mutation(of => ActionResponseModel, { description: '关注用户' })
  @Authorized()
  public async attentionUser(@Ctx() ctx: Context, @Arg('id') id: string) {
    return ctx.service.attentionUser.index.attentionUser(id)
  }

  @Mutation(of => ActionResponseModel, { description: '取消关注用户' })
  @Authorized()
  public async unsubscribe(@Ctx() ctx: Context, @Arg('id') id: string) {
    return ctx.service.attentionUser.index.unsubscribe(id)
  }

  @Query(of => PaginationAttentionUserResponse, {
    description: '获取关注的用户列表'
  })
  @Authorized()
  @UseMiddleware(FieldsMiddleware)
  public async attentionUserList(
    @Ctx() ctx: Context,
    @Arg('page') page: PaginationProp
  ) {
    return ctx.service.attentionUser.index.attentionUserList(page)
  }
}
