import { Ctx, Arg, Mutation, Resolver, UseMiddleware } from 'type-graphql'
import { Context } from 'egg'
import { ActionResponseModel } from '../../../model/BaseModel'
import { RequestLogRecord } from '../../middleware'
import { AddUserProp } from '../user'
import { UserInfo } from '../../../model/user/UserInfo'

@Resolver()
export class LoginResolver {
  @Mutation(of => ActionResponseModel)
  @UseMiddleware(RequestLogRecord)
  public async scanLogin(
    @Ctx() ctx: Context,
    @Arg('unicode', { nullable: false }) unicode: string,
    @Arg('loginToken', { nullable: false }) loginToken: string
  ) {
    return await ctx.service.login.scanLogin(unicode, loginToken)
  }

  @Mutation(of => ActionResponseModel)
  @UseMiddleware(RequestLogRecord)
  public async confirmLogin(
    @Ctx() ctx: Context,
    @Arg('unicode', { nullable: false }) unicode: string,
    @Arg('token', { nullable: false }) token: string
  ) {
    return await ctx.service.login.confirmLogin(unicode, token)
  }

  @Mutation(of => ActionResponseModel)
  @UseMiddleware(RequestLogRecord)
  public async cancelLogin(
    @Ctx() ctx: Context,
    @Arg('unicode', { nullable: false }) unicode: string
  ) {
    return await ctx.service.login.cancelLogin(unicode)
  }

  @Mutation(of => ActionResponseModel)
  public async loginOut(@Ctx() ctx: Context) {
    return await ctx.service.login.loginOut()
  }
  @Mutation(of => ActionResponseModel, { description: '小程序登陆接口' })
  public async wxLogin(@Ctx() ctx: Context, @Arg('user') user: AddUserProp) {
    const u = new UserInfo()
    Object.assign(u, user)
    return await ctx.service.login.wxLogin(u)
  }
}
