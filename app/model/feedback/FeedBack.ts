import BaseModel from '../BaseModel'
import { ObjectType, Field, registerEnumType, ArgsType } from 'type-graphql'
import { Ref, prop, arrayProp } from 'typegoose'
import { UserInfo } from '../user/UserInfo'
import { MaxLength } from 'class-validator'
import { PaginationResponseFactory } from '../Pagination'

export enum FeedbackStatus {
  /**
   * 待处理
   */
  TO_BE_PROCESSED = '1',
  /**
   * 正在处理
   */
  PROCESSING = '2',
  /**
   * 已处理
   */
  PROCESSED = '3',
  /**
   * 已作废
   */
  ABOLISHED = '4'
}
export enum FeedbackType {
  /**
   * 意见
   */
  IDEA = '100',
  /**
   * bug
   */
  BUG = '200',
  /**
   * 吐槽
   */
  MAKE_COMPLAINTS = '300'
}

@ObjectType()
export class Feedback extends BaseModel {
  /**
   * @description 反馈内容
   * @type {string}
   * @memberof FeedBack
   */
  @prop({ trim: true })
  @Field({ description: '反馈内容' })
  content: string
  /**
   * @description 反馈图片
   * @type {string[]}
   * @memberof FeedBack
   */
  @arrayProp({ items: String })
  @Field(type => [String], { nullable: true, description: '反馈图片' })
  @MaxLength(3)
  images: string[]
  /**
   * @description 反馈用户
   * @type {Ref<UserInfo>}
   * @memberof FeedBack
   */
  @prop({ ref: UserInfo })
  @Field(type => UserInfo, { description: '反馈用户' })
  feedbackUser: Ref<UserInfo>

  @prop({ enum: FeedbackType })
  @Field(type => FeedbackType)
  type: FeedbackType
  @prop({ enum: FeedbackStatus, default: FeedbackStatus.TO_BE_PROCESSED })
  @Field(type => FeedbackStatus)
  status: FeedbackStatus
}

@ArgsType()
export class FeedbackArgs implements Partial<Feedback> {
  @Field({ nullable: false, description: '反馈内容' })
  content: string
  @Field(type => [String], { nullable: true, description: '反馈图片列表' })
  images: string[]

  @Field(type => FeedbackType, { description: '反馈类型' })
  type: FeedbackType
}

@ObjectType()
export class PaginationFeedBackResponse extends PaginationResponseFactory(
  Feedback
) {}

registerEnumType(FeedbackType, {
  name: 'FeedbackType',
  description: '反馈类型'
})
registerEnumType(FeedbackStatus, {
  name: 'FeedbackStatus',
  description: '当前反馈条目的状态'
})
const feedbackModel = new Feedback().getModelForClass(Feedback)

export const FeedbackModel = feedbackModel
