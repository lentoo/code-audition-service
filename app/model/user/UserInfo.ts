import { Application } from 'egg'

import {
  prop,
  Ref,
  instanceMethod,
  InstanceType,
  arrayProp,
  staticMethod,
  ModelType,
  index
} from 'typegoose'
import BaseModel from '../BaseModel'
import { PaginationResponseFactory } from '../Pagination'
import { ObjectType, Field } from 'type-graphql'
import { Sort } from '../sort/Sort'
import { Question } from '../question/Question'

@ObjectType()
@index('openId', { unique: true, background: true })
export class UserInfo extends BaseModel {
  /**
   * @description 用户微信openid
   * @type {string}
   * @memberof UserInfo
   */
  @Field({ nullable: true })
  @prop()
  openId?: string
  /**
   * @description 用户昵称
   * @type {string}
   * @memberof UserInfo
   */
  @prop()
  @Field({ nullable: true })
  nickName?: string
  /**
   * @description 用户头像地址
   * @type {string}
   * @memberof UserInfo
   */
  @prop()
  @Field({ nullable: true })
  avatarUrl?: string
  /**
   * @description 用户性别 1 -> 男 2 -> 女
   * @type {string}
   * @memberof UserInfo
   */
  @prop()
  @Field({ nullable: true })
  gender?: string
  /**
   * @description 用户所在省
   * @type {string}
   * @memberof UserInfo
   */
  @prop()
  @Field({ nullable: true })
  province?: string
  /**
   * @description 用户所在国家
   * @type {string}
   * @memberof UserInfo
   */
  @prop()
  @Field({ nullable: true })
  country?: string
  /**
   * @description 用户所在城市
   * @type {string}
   * @memberof UserInfo
   */
  @prop()
  @Field({ nullable: true })
  city?: string

  @prop({ default: 'zh-CN' })
  @Field({ nullable: true })
  language?: string

  /**
   * @description 用户角色
   * @type {string}
   * @memberof UserInfo
   */
  @prop({ default: 'user' })
  @Field({ nullable: true })
  role?: string

  @arrayProp({ itemsRef: Sort })
  @Field(type => [Sort], { nullable: true })
  likeSorts?: Ref<Sort>[]

  @arrayProp({ itemsRef: Question, items: String, default: [] })
  @Field(type => [Question], { nullable: true })
  brushedQuestions: Ref<Question>[]
  /**
   * @description 用户关注分类
   * @author lentoo
   * @date 2019-09-04
   * @param {Sort} sort
   * @memberof UserInfo
   */
  @instanceMethod
  async likeSort(this: InstanceType<UserInfo>, sort: Sort) {
    if (this.likeSorts === undefined) {
      this.likeSorts = []
    }

    if (this.likeSorts.find(sid => String(sid) === String(sort._id))) {
      throw new Error('当前分类已关注')
    }

    this.likeSorts.push(sort)

    return await this.save()
  }
  /**
   * @description 是否关注某个分类
   * @author lentoo
   * @date 2019-09-04
   * @param {InstanceType<UserInfo>} this
   * @param {string} sortId 分类id
   * @returns {boolean}
   * @memberof UserInfo
   */
  @instanceMethod
  public isLikeSortBySortId(this: InstanceType<UserInfo>, sortId: string) {
    if (this.likeSorts === undefined) {
      this.likeSorts = []
      return false
    }
    return !!this.likeSorts!.find(sid => String(sid) === sortId)
  }
  /**
   * @description 判断用户是否存在
   * @author lentoo
   * @date 2019-09-12
   * @static
   * @param {(ModelType<UserInfo> & typeof UserInfo)} this
   * @param {string} openId
   * @returns {boolean}
   * @memberof UserInfo
   */
  @staticMethod
  public static async isExist(
    this: ModelType<UserInfo> & typeof UserInfo,
    openId: string
  ) {
    const user = await this.findOne({
      openId
    }).exec()
    if (!user) {
      throw new Error('用户不存在')
    }
    return user
  }
  /**
   * @description 根据openId查找用户
   * @author lentoo
   * @date 2019-09-12
   * @static
   * @param {(ModelType<UserInfo> & typeof UserInfo)} this
   * @param {string} openId
   * @returns
   * @memberof UserInfo
   */
  @staticMethod
  public static async findUserByOpenId(
    this: ModelType<UserInfo> & typeof UserInfo,
    openId: string
  ) {
    const user = await this.findOne({
      openId
    }).exec()
    return user
  }
}

const user = new UserInfo().getModelForClass(UserInfo)

export const UserInfoModel = user

@ObjectType()
export class PaginationUserResponse extends PaginationResponseFactory(
  UserInfo
) {}

export default (app: Application) => {
  return user
}
