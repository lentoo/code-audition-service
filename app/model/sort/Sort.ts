import { Application } from 'egg'
import BaseModel from '../BaseModel'
import { prop } from 'typegoose'
import { ObjectType, Field } from 'type-graphql'

@ObjectType()
export class Sort extends BaseModel {
  /**
   * @description 分类名称
   * @type {string}
   * @memberof ISort
   */
  @prop()
  @Field()
  sortName?: string
  /**
   * @description 图标地址
   * @type {string}
   * @memberof ISort
   */
  @prop()
  @Field()
  icon?: string
  /**
   * @description 是否选择
   * @type {string}
   * @memberof ISort
   */
  @prop()
  @Field()
  select?: number
  /**
   * @description 关注人数
   * @type {number}
   * @memberof ISort
   */
  @prop()
  @Field()
  attentionNum?: number
  /**
   * @description 题目数
   * @type {number}
   * @memberof ISort
   */
  @prop()
  @Field()
  questionNum?: number
}

export const SortModel = new Sort().getModelForClass(Sort)

export default (app: Application) => {
  return SortModel
}
