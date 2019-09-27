import {
  Resolver,
  Mutation,
  Args,
  Ctx,
  Authorized,
  Query,
  Arg
} from 'type-graphql'
import { ActionResponseModel } from '../../../model/BaseModel'
import { Context } from 'egg'
import {
  FeedbackArgs,
  PaginationFeedBackResponse,
  FeedbackType,
  FeedbackStatus
} from '../../../model/feedback/FeedBack'
import { PaginationProp } from '../../../model/Pagination'
@Resolver()
export class FeedbackResolver {
  @Mutation(type => ActionResponseModel, { description: '提交反馈' })
  @Authorized()
  public async addFeedbackItem(
    @Ctx() ctx: Context,
    @Args() item: FeedbackArgs
  ) {
    console.log('FeedbackArgs', item)
    return ctx.service.feedback.index.addFeedBackItem(item)
  }

  @Query(type => PaginationFeedBackResponse)
  public async fetchFeedback(
    @Ctx() ctx: Context,
    @Arg('page') page: PaginationProp,
    @Arg('type', type => FeedbackType, { nullable: true })
    type: FeedbackType,
    @Arg('status', type => FeedbackStatus, { nullable: true })
    status: FeedbackStatus,
    @Arg('name', { defaultValue: '', nullable: true }) name: string
  ) {
    return ctx.service.feedback.index.fetchFeedback(page, type, status, name)
  }
  @Mutation(type => ActionResponseModel, { description: '审核反馈内容' })
  @Authorized()
  public async auditFeedback(
    @Ctx() ctx: Context,
    @Arg('id') id: string,
    @Arg('status', type => FeedbackStatus) status: FeedbackStatus,
    @Arg('resultContent') resultContent: string
  ) {
    return ctx.service.feedback.index.auditFeedback(id, status, resultContent)
  }
}
