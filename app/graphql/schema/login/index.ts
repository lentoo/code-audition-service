import { Ctx, Arg, Mutation, Resolver, UseMiddleware } from 'type-graphql'
import { Context } from 'egg'
import { ActionResponseModel } from '../../../model/BaseModel'
import { RequestLogRecord } from '../../middleware'

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
}
