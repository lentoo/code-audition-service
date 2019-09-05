import { Application } from 'egg'

import {
  prop,
  pre,
  Ref,
  instanceMethod,
  InstanceType,
  arrayProp,
  staticMethod,
  ModelType
} from 'typegoose'
import BaseModel from '../BaseModel'
import { PaginationResponseFactory } from '../Pagination'
import { ObjectType, Field } from 'type-graphql'
import { Sort } from '../sort/Sort'

@ObjectType()
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
  @Field()
  nickName?: string
  /**
   * @description 用户头像地址
   * @type {string}
   * @memberof UserInfo
   */
  @prop()
  @Field()
  avatarUrl?: string
  /**
   * @description 用户性别 1 -> 男 2 -> 女
   * @type {string}
   * @memberof UserInfo
   */
  @prop()
  @Field()
  gender?: string
  /**
   * @description 用户所在省
   * @type {string}
   * @memberof UserInfo
   */
  @prop()
  @Field()
  province?: string
  /**
   * @description 用户所在国家
   * @type {string}
   * @memberof UserInfo
   */
  @prop()
  @Field()
  country?: string
  /**
   * @description 用户所在城市
   * @type {string}
   * @memberof UserInfo
   */
  @prop()
  @Field()
  city?: string

  /**
   * @description 用户角色
   * @type {string}
   * @memberof UserInfo
   */
  @prop({ default: 'user' })
  @Field()
  role?: string

  @arrayProp({ itemsRef: Sort, items: String })
  @Field(type => [Sort], { nullable: true })
  likeSorts?: Ref<Sort>[]
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
}

const user = new UserInfo().getModelForClass(UserInfo)

export const UserInfoModel = user

export class PaginationUserResponse extends PaginationResponseFactory(
  UserInfo
) {}

export default (app: Application) => {
  return user
}
