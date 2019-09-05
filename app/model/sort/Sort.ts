import { Application } from 'egg'
import BaseModel from '../BaseModel'
import { prop } from 'typegoose'
import { ObjectType, Field } from 'type-graphql'
import { PaginationResponseFactory } from '../Pagination'

@ObjectType()
export class Sort extends BaseModel {
  /**
   * @description 分类名称
   * @type {string}
   * @memberof ISort
   */
  @prop({ required: true })
  @Field({ nullable: true })
  sortName?: string
  /**
   * @description 图标地址
   * @type {string}
   * @memberof ISort
   */
  @prop({ required: true })
  @Field({ nullable: true })
  icon?: string
  /**
   * @description 关注人数
   * @type {number}
   * @memberof ISort
   */
  @prop({ default: 0 })
  @Field({ nullable: true })
  attentionNum?: number
  /**
   * @description 题目数
   * @type {number}
   * @memberof ISort
   */
  @prop({ default: 0 })
  @Field({ nullable: true })
  questionNum?: number
}

export const SortModel = new Sort().getModelForClass(Sort)

@ObjectType()
export class PaginationSortResponse extends PaginationResponseFactory(Sort) {}

export default (app: Application) => {
  return SortModel
}
