import { Application } from 'egg'
import { ObjectType, Field } from 'type-graphql'
import { prop, Ref, arrayProp } from 'typegoose'
import BaseModel from '../BaseModel'
import { UserInfo } from '../user/UserInfo'
import { Sort } from '../sort/Sort'
import { PaginationResponseFactory } from '../Pagination'
/**
 * @description 审核信息
 * @author lentoo
 * @date 2019-09-14
 * @export
 * @interface AuditInfo
 */

@ObjectType()
export class AuditInfo {
  /**
   * @description 审核人id
   * @type {string}
   * @memberof AuditInfo
   */
  @Field()
  auditPersonId: string
  /**
   * @description 审核人姓名
   * @type {string}
   * @memberof AuditInfo
   */
  @Field()
  auditName: string
  /**
   * @description 审核时间
   * @type {Date}
   * @memberof AuditInfo
   */
  @Field()
  auditDate: Date
  /**
   * @description 原因
   * @type {string}
   * @memberof AuditInfo
   */
  @Field()
  reason: string
}
export enum AuditStatusType {
  '待审核' = 1000,
  '正在审核' = 1001,
  '已驳回' = 3000,
  '已通过' = 2000
}

@ObjectType()
export class Question extends BaseModel {
  /**
   * @description 标题
   * @type {string}
   * @memberof Question
   */
  @prop({ required: true, unique: true })
  @Field()
  title: string

  @prop({ required: false })
  @Field({ nullable: true })
  descriptionOfhtml: string

  @prop({ required: false })
  @Field({ nullable: true })
  descriptionOfmarkdown: string

  @prop({ required: false })
  @Field({ nullable: true })
  answerOfhtml: string
  @prop({ required: false })
  @Field({ nullable: true })
  answerOfmarkdown: string
  /**
   * @description 浏览量
   * @type {number}
   * @memberof Question
   */
  @prop({ required: false, default: 0 })
  @Field({ nullable: true })
  browse: number

  /**
   * @description 收藏数
   * @type {number}
   * @memberof Question
   */
  @prop({ default: 0 })
  @Field({ nullable: true })
  collectionNum: number
  /**
   * @description 审核状态
   * 1000 => 审核中
   * 1001 => 正在处理
   * 2000 => 已通过
   * 3000 => 已驳回
   * @type {string}
   * @memberof Question
   */
  @prop({ required: true, default: 1000 })
  @Field({ nullable: false })
  auditStatus: AuditStatusType
  /**
   * @description 审核信息
   * @type {AuditInfo}
   * @memberof Question
   */
  @prop({ required: false })
  @Field({ nullable: true })
  auditInfo: AuditInfo
  /**
   * @description 所属用户
   * @type {Ref<UserInfo>}
   * @memberof Question
   */
  @prop({ ref: String })
  @Field(type => UserInfo, { nullable: true })
  userinfo: Ref<UserInfo>
  /**
   * @description 题目所属分类
   * @type {Ref<Sort>[]}
   * @memberof Question
   */
  @arrayProp({ itemsRef: Sort, default: [] })
  @Field(type => [Sort])
  sort: Ref<Sort>[]
  /**
   * @description 推送时使用，用于用户是否收藏了该题目
   * @type {boolean}
   * @memberof Question
   */
  @Field({ nullable: true })
  isCollection: boolean
}

const questionModel = new Question().getModelForClass(Question)

@ObjectType()
export class PaginationQuestionResponse extends PaginationResponseFactory(
  Question
) {}
export const QuestionModel = questionModel

export default (app: Application) => {
  return questionModel
}
