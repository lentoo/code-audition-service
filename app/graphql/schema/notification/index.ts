import { Resolver, Ctx, Arg, Mutation, Args, Query } from 'type-graphql'
import {
  CreateNotifyProp,
  UserNotify,
  DeleteUnReadNotifyProp
} from '../../../model/notification/Notification'
import { Context } from 'egg'
import { ActionResponseModel } from '../../../model/BaseModel'
@Resolver()
export class NotificationResolver {
  @Mutation(type => ActionResponseModel)
  public async createNofity(
    @Ctx() ctx: Context,
    @Args() prop: CreateNotifyProp
  ) {
    return ctx.service.notification.index.createNotify(prop)
  }
  @Query(type => [UserNotify])
  public async getUserNotify(@Ctx() ctx: Context, @Arg('uid') uid: string) {
    return ctx.service.notification.index.getUserNotify(uid)
  }

  @Mutation(type => ActionResponseModel)
  public async readNotify(
    @Ctx() ctx: Context,
    @Arg('uid') uid: string,
    @Arg('nid') nid: string
  ) {
    return ctx.service.notification.index.readNotify(uid, nid)
  }
  @Mutation(type => ActionResponseModel)
  public async deleteUnReadNotify(
    @Ctx() ctx: Context,
    @Args() prop: DeleteUnReadNotifyProp
  ) {
    return ctx.service.notification.index.deleteUnReadNotify(prop)
  }
}
