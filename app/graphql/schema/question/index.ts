import { Context } from 'egg'
import {
  Resolver,
  Mutation,
  Ctx,
  InputType,
  Field,
  Arg,
  Query,
  UseMiddleware,
  Root
} from 'type-graphql'
import { ActionResponseModel } from '../../../model/BaseModel'
import {
  Question,
  PaginationQuestionResponse,
  AuditStatusType
} from '../../../model/question/Question'
import {
  ResolveRequestTime,
  RequestLogRecord,
  Authorization,
  FieldsMiddleware
} from '../../middleware'

@InputType()
class QuestionProp {
  @Field({ nullable: true })
  public _id: string
  @Field(type => [String], { nullable: false })
  public sort: string[]
  @Field({ nullable: false })
  public title: string

  @Field({ nullable: true })
  public descriptionOfhtml: string
  @Field({ nullable: true })
  public descriptionOfmarkdown: string
  @Field({ nullable: true })
  public answerOfhtml: string
  @Field({ nullable: true })
  public answerOfmarkdown: string
}

@Resolver()
export class QuestionResolver {
  @Mutation(of => ActionResponseModel)
  @UseMiddleware(ResolveRequestTime, RequestLogRecord)
  public async addQuestion(
    @Ctx() ctx: Context,
    @Arg('data') data: QuestionProp
  ) {
    const question = new Question()
    question.title = data.title
    question.descriptionOfhtml = data.descriptionOfhtml
    question.descriptionOfmarkdown = data.descriptionOfmarkdown
    question.answerOfhtml = data.answerOfhtml
    question.answerOfmarkdown = data.answerOfmarkdown
    return ctx.service.question.index.addQuestion(question, data.sort)
  }

  @Mutation(of => ActionResponseModel)
  @UseMiddleware(ResolveRequestTime, RequestLogRecord)
  public async updateQuestion(
    @Ctx() ctx: Context,
    @Arg('data') data: QuestionProp
  ) {
    const question = new Question()
    question._id = data._id
    question.title = data.title
    question.descriptionOfhtml = data.descriptionOfhtml
    question.descriptionOfmarkdown = data.descriptionOfmarkdown
    question.answerOfhtml = data.answerOfhtml
    question.answerOfmarkdown = data.answerOfmarkdown
    return ctx.service.question.index.updateQuestion(question, data.sort)
  }

  /**
   * 删除题目
   */
  @Mutation(of => ActionResponseModel)
  @UseMiddleware(ResolveRequestTime, RequestLogRecord)
  public async removeQuestion(@Ctx() ctx: Context, @Arg('id') id: string) {
    return ctx.service.question.index.removeQuestion(id)
  }

  @Query(of => PaginationQuestionResponse)
  @UseMiddleware(ResolveRequestTime, RequestLogRecord)
  public async fetchQuestionList(
    @Ctx() ctx: Context,
    @Arg('page', { nullable: true, defaultValue: 1 }) page: number,
    @Arg('limit', { nullable: true, defaultValue: 20 }) limit: number,
    @Arg('nickName', { nullable: true }) nickName: string,
    @Arg('auditStatus', { nullable: true }) auditStatus: number
  ) {
    return ctx.service.question.index.fetchQuestionList(
      page,
      limit,
      nickName,
      auditStatus
    )
  }

  @Query(of => Question)
  @UseMiddleware(FieldsMiddleware, ResolveRequestTime, RequestLogRecord)
  public async fetchQuestion(@Ctx() ctx: Context, @Arg('id') _id: string) {
    return ctx.service.question.index.fetchQuestion(_id)
  }

  @Mutation(of => ActionResponseModel)
  @UseMiddleware(RequestLogRecord)
  public async reviewQuestion(
    @Ctx() ctx: Context,
    @Arg('id') _id: string,
    @Arg('reason') reason: string,
    @Arg('status') status: AuditStatusType
  ) {
    return ctx.service.question.index.reviewQuestion(_id, status, reason)
  }
}
