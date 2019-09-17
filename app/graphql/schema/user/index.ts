import {
  Resolver,
  Query,
  Ctx,
  Arg,
  Mutation,
  InputType,
  Field,
  UseMiddleware
} from 'type-graphql'
import { Context } from 'egg'
import { UserInfo, PaginationUserResponse } from '../../../model/user/UserInfo'
import { RequestLogRecord, ResolveRequestTime } from '../../middleware'
import { ActionResponseModel } from '../../../model/BaseModel'
@InputType({ description: '新增用户类型' })
export class AddUserProp {
  @Field({ nullable: false })
  nickName: string
  @Field({ nullable: false })
  avatarUrl: string
  @Field({ nullable: false })
  gender: number
  @Field({ nullable: false })
  province: string
  @Field({ nullable: false })
  country: string
  @Field({ nullable: false })
  city: string
  @Field({ nullable: true })
  language: string
  @Field({ nullable: true })
  openId: string
}

@Resolver(() => UserInfo)
export class UserInfoResolver {
  @Query(returns => PaginationUserResponse, {
    name: 'users',
    description: '查询用户列表'
  })
  @UseMiddleware(RequestLogRecord, ResolveRequestTime)
  async fetchUserList(
    @Ctx() ctx: Context,
    @Arg('_id', { nullable: true }) id: string
  ) {
    return await ctx.service.userInfo.getUserList(id)
  }

  @Query(returns => UserInfo, { name: 'user', description: '查询用户信息' })
  async fetchUser(@Arg('_id') id: string, @Ctx() ctx: Context) {
    return await ctx.service.userInfo.findUserByOpenId(id)
  }

  @Mutation(() => UserInfo, { name: 'addUser' })
  async saveUser(
    @Ctx() ctx: Context,
    @Arg('user', { nullable: true }) user: AddUserProp
  ): Promise<UserInfo> {
    const u = new UserInfo()
    Object.assign(u, user)

    return await ctx.service.userInfo.saveUserInfo(u)
  }

  @Mutation(() => ActionResponseModel, { name: 'likeSort' })
  async likeSort(@Ctx() ctx: Context, @Arg('sortId') sortId: string) {
    return await ctx.service.userInfo.userLikeSort(sortId)
  }

  @Mutation(() => ActionResponseModel, { name: 'unLikeSort' })
  async unLikeSort(@Ctx() ctx: Context, @Arg('sortId') sortId: string) {
    return await ctx.service.userInfo.userUnLikeSort(sortId)
  }
}
