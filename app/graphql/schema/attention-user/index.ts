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
import AttentionUser, {
  PaginationAttentionUserResponse
} from '../../../model/attention-user/AttentionUser'
import { PaginationProp } from '../../../model/Pagination'
import { FieldsMiddleware } from '../../middleware'
import { PaginationUserResponse } from '../../../model/user/UserInfo'
@Resolver()
export class AttentionUserResolver {
  @Mutation(of => ActionResponseModel, { description: '关注用户' })
  @Authorized()
  public async attentionUser(@Ctx() ctx: Context, @Arg('id') id: string) {
    // const user = await ctx.currentUserInfo()
    const user = await ctx.service.base.getAuthUser()
    return ctx.service.attentionUser.index.attentionUser(id, user)
  }

  @Mutation(of => ActionResponseModel, { description: '通过ID来关注用户' })
  @Authorized()
  public async attentionUserByUid(
    @Ctx() ctx: Context,
    @Arg('uid') uid: string,
    @Arg('id') id: string
  ) {
    return ctx.service.attentionUser.index.attentionUserByUid(uid, id)
  }

  @Mutation(of => ActionResponseModel, { description: '取消关注用户' })
  @Authorized()
  public async unsubscribe(@Ctx() ctx: Context, @Arg('id') id: string) {
    return ctx.service.attentionUser.index.unsubscribe(id)
  }

  @Query(of => PaginationUserResponse, {
    description: '获取关注的用户列表'
  })
  @Authorized()
  @UseMiddleware(FieldsMiddleware)
  public async attentionUserList(
    @Ctx() ctx: Context,
    @Arg('uid') uid: string,
    @Arg('page') page: PaginationProp
  ) {
    return ctx.service.attentionUser.index.getAttentionUserList(uid, page)
  }

  @Query(of => PaginationAttentionUserResponse, {
    description: '获取关注我的用户列表'
  })
  @Authorized()
  public async attentionSelfUserList(
    @Ctx() ctx: Context,
    @Arg('page', { defaultValue: { page: 1, limit: 10 } }) page: PaginationProp,
    @Arg('uid') uid: string
  ) {
    return ctx.service.attentionUser.index.getFansList(uid, page)
  }
}
