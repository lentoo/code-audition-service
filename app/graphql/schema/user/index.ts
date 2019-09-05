import {
  Resolver,
  Query,
  Ctx,
  Arg,
  Mutation,
  InputType,
  Field
} from 'type-graphql'
import { Context } from 'egg'
import { UserInfo } from '../../../model/user/UserInfo'
@InputType({ description: '新增用户类型' })
class AddUserProp {
  @Field({ nullable: false })
  nickName: string
  @Field({ nullable: false })
  avatarUrl: string
  @Field({ nullable: false })
  gender: string
  @Field({ nullable: false })
  province: string
  @Field({ nullable: false })
  country: string
  @Field({ nullable: false })
  city: string
}

@Resolver(() => UserInfo)
export class UserInfoResolver {
  @Query(returns => [UserInfo], { name: 'users', description: '查询用户列表' })
  async fetchUserList(
    @Ctx() ctx: Context,
    @Arg('_id', { nullable: true }) id: string
  ) {
    return await ctx.service.userInfo.getUserList(id)
  }

  @Query(of => UserInfo, { name: 'user', description: '查询用户信息' })
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

  @Mutation(() => UserInfo, { name: 'likeSort' })
  async likeSort(@Ctx() ctx: Context, @Arg('sortId') sortId: string) {
    const openId = ctx.headers['header-key']
    return await ctx.service.userInfo.userLikeSort(openId, sortId)
  }

  @Mutation(() => UserInfo, { name: 'unLikeSort' })
  async unLikeSort(@Ctx() ctx: Context, @Arg('sortId') sortId: string) {
    const openId = ctx.headers['header-key']
    return await ctx.service.userInfo.userUnLikeSort(openId, sortId)
  }
}
